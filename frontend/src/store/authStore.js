import { create } from 'zustand'
import { authApi } from '../api/auth'

const TOKEN_KEY = 'dost_tna_token'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  loading: false,
  initialized: false,

  async login(email, password) {
    set({ loading: true })
    try {
      const { user, token } = await authApi.login(email, password)
      localStorage.setItem(TOKEN_KEY, token)
      set({ user, token, loading: false })
      return user
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  async logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null })
  },

  // Called once on app boot: if a token exists, hydrate the current user.
  async bootstrap() {
    const token = get().token
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const user = await authApi.me()
      set({ user, initialized: true })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, token: null, initialized: true })
    }
  },
}))
