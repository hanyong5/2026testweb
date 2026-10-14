import { create } from 'zustand'
import { fetchRecentNotices } from '../lib/notices'

let requestVersion = 0
export const useRecentNoticeStore = create(set => ({
  items: [], loading: true, error: '',
  load: async () => {
    const request = ++requestVersion
    set({ loading: true, error: '' })
    try {
      const items = await fetchRecentNotices()
      if (request === requestVersion) set({ items, loading: false })
    } catch {
      if (request === requestVersion) set({ loading: false, error: '최근 공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' })
    }
  },
}))
