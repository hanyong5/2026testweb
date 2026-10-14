import { create } from 'zustand'
import { ensureProfile, supabase, updateProfile } from '../lib/supabase'

let sessionVersion = 0
let profileRequest = 0
let subscribers = 0
let subscription = null

export const useAuthStore = create((set, get) => ({
  user: null, ready: !supabase, error: '', profile: null, role: null, profileError: '', profileLoading: false, signingOut: false,
  retryProfile: async () => {
    const user = get().user
    if (!user) return
    const version = sessionVersion
    const request = ++profileRequest
    set({ profileLoading: true, profileError: '' })
    try {
      const profile = await ensureProfile(user)
      if (version === sessionVersion && request === profileRequest) set({ profile, role: profile.role === 'admin' ? 'admin' : 'user', profileLoading: false })
    } catch {
      if (version === sessionVersion && request === profileRequest) set({ profileLoading: false, profileError: '회원 정보를 불러오지 못했습니다. 다시 시도해 주세요.' })
    }
  },
  saveProfile: async values => {
    const user = get().user
    if (!user) throw new Error('not_authenticated')
    const version = sessionVersion
    const profile = await updateProfile(user.id, values)
    if (version !== sessionVersion || get().user?.id !== user.id) throw new Error('session_changed')
    // Prevent an older fetch from replacing the saved changes.
    profileRequest++
    set({ profile, role: profile.role === 'admin' ? 'admin' : 'user', profileError: '', profileLoading: false })
    return profile
  },
  signOut: async () => {
    if (!supabase || get().signingOut) return
    set({ signingOut: true })
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
      sessionVersion++
      profileRequest++
      set({ user: null, profile: null, role: null, profileError: '', profileLoading: false, error: '' })
    } catch {
      set({ error: '로그아웃하지 못했습니다. 다시 시도해 주세요.' })
    } finally {
      set({ signingOut: false })
    }
  },
}))

// A single subscription, including React StrictMode setup/cleanup cycles.
export function initializeAuth() {
  if (!supabase) return () => {}
  subscribers++
  if (!subscription) {
    const result = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null
      const changed = useAuthStore.getState().user?.id !== user?.id
      if (changed || event === 'SIGNED_OUT') {
        sessionVersion++
        profileRequest++
        useAuthStore.setState({ profile: null, role: null, profileError: '', profileLoading: false })
      }
      useAuthStore.setState({ user, ready: true, error: '' })
      if (user && (changed || !useAuthStore.getState().profile)) {
        const version = sessionVersion
        // API work runs outside the callback to avoid the Auth session lock.
        setTimeout(() => {
          if (subscribers && version === sessionVersion) void useAuthStore.getState().retryProfile()
        }, 0)
      }
    })
    subscription = result.data.subscription
  }
  let active = true
  return () => {
    if (!active) return
    active = false
    if (--subscribers === 0) {
      subscription?.unsubscribe()
      subscription = null
      sessionVersion++
      profileRequest++
    }
  }
}
