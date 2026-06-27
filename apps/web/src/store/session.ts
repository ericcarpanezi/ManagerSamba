import { create } from 'zustand'

type SessionState = {
  username: string | null
  setUsername: (username: string) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  username: null,
  setUsername: (username) => set({ username }),
  clearSession: () => set({ username: null }),
}))
