// guest-only — redirects authed users to /inbox; renders children only for guests.
import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context-core'

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/inbox" replace />
  return <>{children}</>
}