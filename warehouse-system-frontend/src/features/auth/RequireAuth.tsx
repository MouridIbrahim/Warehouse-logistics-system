import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth-context'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}
