import { create } from 'zustand'
import { areas, data } from '../components/nearbyData'

function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem('gyeot-saved') || '[]')
    return new Set(Array.isArray(value) ? value.filter(id => data.some(place => place.id === id)) : [])
  } catch { return new Set() }
}

export const useNearbyStore = create((set, get) => ({
  region: 'seongsu', currentCenter: null, filter: 'all', query: '', selected: null,
  saved: readSaved(), status: '', locating: false,
  setRegion: region => {
    if (areas[region] || (region === 'current' && get().currentCenter)) set({ region, selected: null })
  },
  setFilter: filter => set({ filter }),
  setQuery: query => set({ query }),
  setSelected: selected => set({ selected }),
  toggleSave: id => {
    if (!data.some(place => place.id === id)) return
    const saved = new Set(get().saved)
    if (saved.has(id)) saved.delete(id)
    else saved.add(id)
    set({ saved })
    try { localStorage.setItem('gyeot-saved', JSON.stringify([...saved])) }
    catch { set({ status: '브라우저 저장을 사용할 수 없어 이번 방문 동안만 저장됩니다.' }) }
  },
  locate: onReady => {
    if (get().locating) return
    if (!window.isSecureContext || !navigator.geolocation) {
      set({ status: '현재 위치는 HTTPS 또는 localhost에서 사용할 수 있어요. 아래에서 동네를 직접 선택해 주세요.' })
      onReady?.()
      return
    }
    set({ locating: true, status: '브라우저의 위치 권한 요청을 확인해 주세요.' })
    navigator.geolocation.getCurrentPosition(position => {
      set({ currentCenter: { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null }, region: 'current', selected: null, locating: false,
        status: '현재 위치를 확인했어요. 예시 장소를 가까운 순서로 보여드립니다. 실시간 주변 매장 정보는 제공하지 않습니다.' })
      onReady?.()
    }, error => {
      set({ locating: false, status: error.code === 1 ? '위치 접근이 허용되지 않았어요. 동네를 직접 선택해도 둘러볼 수 있어요.' : error.code === 3 ? '위치 확인이 늦어지고 있어요. 다시 시도하거나 동네를 선택해 주세요.' : '현재 위치를 확인하지 못했어요. 동네를 직접 선택해 주세요.' })
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 })
  },
}))
