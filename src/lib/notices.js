import { supabase } from './supabase'
import { MAX_NOTICE_IMAGES, uploadNoticeImage, removeNoticeImages, validateNoticeFiles } from './noticeImages'

export const NOTICE_PAGE_SIZE = 10
const noticeFields = 'id, title, body, image_paths, created_at, updated_at'

function client() {
  if (!supabase) throw new Error('notices_not_configured')
  return supabase
}

function values(title, body) {
  const next = { title: title.trim(), body: body.trim() }
  if (!next.title || next.title.length > 120 || !next.body || next.body.length > 10000) throw new Error('notice_invalid')
  return next
}

export async function fetchNotices(page, query) {
  let request = client().from('notices').select('id, title, image_paths, created_at, updated_at', { count: 'exact' })
  if (query.trim()) request = request.ilike('title', `%${query.trim().replace(/[\\%_]/g, '\\$&')}%`)
  const start = (page - 1) * NOTICE_PAGE_SIZE
  const { data, count, error } = await request.order('created_at', { ascending: false }).order('id', { ascending: false }).range(start, start + NOTICE_PAGE_SIZE - 1)
  if (error) throw error
  return { items: data, total: count ?? 0 }
}

export async function fetchNotice(id) {
  const { data, error } = await client().from('notices').select(noticeFields).eq('id', id).single()
  if (error) throw error
  return data
}

export async function fetchRecentNotices() {
  const { data, error } = await client().from('notices').select('id, title, image_paths, created_at')
    .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(3)
  if (error) throw error
  return data
}

export async function saveNotice(id, title, body, images = [], originalPaths = []) {
  const next = values(title, body)
  if (images.length > MAX_NOTICE_IMAGES || validateNoticeFiles(images.filter(image => image.file).map(image => image.file), images.filter(image => !image.file).length)) throw new Error('notice_images_invalid')
  const uploaded = []
  let data
  try {
    next.image_paths = []
    for (const image of images) {
      if (image.file) {
        const path = await uploadNoticeImage(image.file)
        uploaded.push(path)
        next.image_paths.push(path)
      } else next.image_paths.push(image.path)
    }
    const request = id == null ? client().from('notices').insert(next) : client().from('notices').update(next).eq('id', id)
    const result = await request.select(noticeFields).single()
    if (result.error) throw result.error
    data = result.data
  } catch (error) {
    const cleanupWarning = await removeNoticeImages(uploaded)
    if (cleanupWarning) error.cleanupWarning = cleanupWarning
    throw error
  }
  const removed = originalPaths.filter(path => !next.image_paths.includes(path))
  const cleanupWarning = await removeNoticeImages(removed)
  return { ...data, cleanupWarning }
}

export async function deleteNotice(id) {
  const { data, error } = await client().from('notices').delete().eq('id', id).select('id, image_paths').single()
  if (error) throw error
  return { cleanupWarning: await removeNoticeImages(data.image_paths || []) }
}

export function noticeErrorMessage(error) {
  if (error?.cleanupWarning) return `저장하지 못했습니다. ${error.cleanupWarning} 입력 내용은 유지됩니다.`
  if (error?.code === '42501' || error?.status === 403) return '공지사항 관리 권한이 없습니다. 관리자 계정인지 확인해 주세요.'
  if (error?.code === 'PGRST116') return '공지사항이 삭제되었거나 처리할 수 없습니다. 목록을 다시 불러와 주세요.'
  return '요청을 처리하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.'
}
