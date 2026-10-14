import { create } from 'zustand'
import { fetchNotices, fetchNotice, saveNotice, deleteNotice, noticeErrorMessage, NOTICE_PAGE_SIZE } from '../lib/notices'
import { useAuthStore } from './authStore'

let listRequest = 0
let detailRequest = 0

function requireAdmin() {
  const auth = useAuthStore.getState()
  if (!auth.user || auth.role !== 'admin') throw Object.assign(new Error('not_admin'), { code: '42501' })
}

export const useNoticeStore = create((set, get) => ({
  items: [], total: 0, page: 1, query: '', loading: false, error: '',
  selected: null, detailLoading: false, detailError: '',
  load: async (page = get().page, query = get().query) => {
    const request = ++listRequest
    set({ page, query, loading: true, error: '' })
    try {
      const result = await fetchNotices(page, query)
      if (request !== listRequest) return
      const lastPage = Math.max(1, Math.ceil(result.total / NOTICE_PAGE_SIZE))
      if (page > lastPage) return get().load(lastPage, query)
      set({ ...result, loading: false })
    } catch (error) {
      if (request === listRequest) set({ loading: false, error: noticeErrorMessage(error) })
    }
  },
  open: async id => {
    const request = ++detailRequest
    set({ selected: null, detailLoading: true, detailError: '' })
    try {
      const selected = await fetchNotice(id)
      if (request === detailRequest) set({ selected, detailLoading: false })
    } catch (error) {
      if (request === detailRequest) set({ detailLoading: false, detailError: noticeErrorMessage(error) })
    }
  },
  close: () => {
    detailRequest++
    set({ selected: null, detailLoading: false, detailError: '' })
  },
  save: async (id, title, body, images, originalPaths) => {
    requireAdmin()
    return saveNotice(id, title, body, images, originalPaths)
  },
  remove: async id => {
    requireAdmin()
    return deleteNotice(id)
  },
}))
