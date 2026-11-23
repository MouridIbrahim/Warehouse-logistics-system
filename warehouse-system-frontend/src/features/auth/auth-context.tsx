import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserDto } from '../../types'
import * as authApi from './api'

interface AuthContextValue {
  token: string | null
  user: UserDto | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (payload: { username: string; password: string; displayName: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readUser(): UserDto | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserDto
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<UserDto | null>(readUser)

  useEffect(() => {
    // Refresh the current user from the backend when a token exists.
    if (token && !user) {
      authApi
        .me()
        .then(setUser)
        .catch(() => {
          setToken(null)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        })
    }
  }, [token, user])

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password)
    localStorage.setItem('token', res.accessToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    setToken(res.accessToken)
    setUser(res.user)
  }

  async function register(payload: { username: string; password: string; displayName: string }) {
    await authApi.register(payload)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
