import { create } from 'zustand'

export const useUiStore = create(set => ({
  menuOpen: false,
  setMenuOpen: value => set({ menuOpen: value }),
  activeSlide: 0,
  setActiveSlide: value => set({ activeSlide: value }),
  moveSlide: direction => set(state => ({ activeSlide: (state.activeSlide + direction + 3) % 3 })),
}))
