import { supabase } from './supabase'

export const NOTICE_IMAGE_BUCKET = 'notice-images'
export const MAX_NOTICE_IMAGES = 3
export const MAX_NOTICE_IMAGE_BYTES = 5 * 1024 * 1024
export const NOTICE_IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export function validateNoticeFiles(files, existingCount = 0) {
  if (files.length + existingCount > MAX_NOTICE_IMAGES) return '이미지는 공지당 최대 3장까지 첨부할 수 있습니다.'
  for (const file of files) {
    if (!NOTICE_IMAGE_TYPES[file.type]) return 'JPG, PNG, WebP 이미지만 첨부할 수 있습니다.'
    if (!file.size || file.size > MAX_NOTICE_IMAGE_BYTES) return '빈 파일은 첨부할 수 없으며 이미지 한 장은 최대 5MB입니다.'
  }
  return ''
}

export function noticeImageUrl(path) {
  return path && supabase ? supabase.storage.from(NOTICE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl : ''
}

export async function uploadNoticeImage(file) {
  const invalid = validateNoticeFiles([file])
  if (invalid) throw new Error(invalid)
  const path = `notices/${crypto.randomUUID()}.${NOTICE_IMAGE_TYPES[file.type]}`
  const { error } = await supabase.storage.from(NOTICE_IMAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false, cacheControl: '3600' })
  if (error) throw error
  return path
}

export async function removeNoticeImages(paths) {
  if (!paths.length) return ''
  try {
    const { data, error } = await supabase.storage.from(NOTICE_IMAGE_BUCKET).remove([...new Set(paths)])
    if (error) throw error
    if (!data || data.length < new Set(paths).size) throw new Error('image_cleanup_incomplete')
    return ''
  } catch {
    return '일부 이미지 파일 정리를 완료하지 못했습니다. 관리자 확인이 필요합니다.'
  }
}
