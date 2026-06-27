import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SessionState = {
  accessToken: string | null
  username: string | null
  roles: string[]
  permissions: string[]
  setSession: (session: {
    accessToken: string
    username: string
    roles: string[]
    permissions: string[]
  }) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      username: null,
      roles: [],
      permissions: [],
      setSession: (session) =>
        set({
          accessToken: session.accessToken,
          username: session.username,
          roles: session.roles,
          permissions: session.permissions,
        }),
      clearSession: () =>
        set({
          accessToken: null,
          username: null,
          roles: [],
          permissions: [],
        }),
    }),
    {
      name: 'ag-directory-session',
    },
  ),
)
