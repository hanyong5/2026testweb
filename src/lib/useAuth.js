import { useEffect } from 'react'
import { initializeAuth } from '../stores/authStore'

// Mount once in App; components read shared state from useAuthStore.
export function useAuth() {
  useEffect(initializeAuth, [])
}
