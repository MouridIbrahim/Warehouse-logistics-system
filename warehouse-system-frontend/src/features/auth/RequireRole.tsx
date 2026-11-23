import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth-context'
import { hasAnyRole } from './permissions'

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth()
  if (!hasAnyRole(user, roles)) return <Navigate to="/app/access-denied" replace />
  return <>{children}</>
}
