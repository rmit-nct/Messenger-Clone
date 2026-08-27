// require-auth — redirects guests to /login; shows a loading gate while session resolves.
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context-core'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null // TODO: shared loading/skeleton screen before 1.1 merges
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}