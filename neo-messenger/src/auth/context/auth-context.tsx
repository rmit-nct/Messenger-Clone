// AuthProvider — loads session, subscribes to onAuthStateChange, exposes auth methods via context.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../../shared/lib/supabase/client'
import { AuthContext, type AuthContextValue } from './auth-context-core'
import * as auth from '../service/auth-service'
import type { Session, User } from '@supabase/supabase-js'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Throw on error so pages can surface it; on success the onAuthStateChange callback
  // updates session/user (single source of truth for callers).
  // Accepts any supabase auth response; only needs the optional .error field.
  async function run(fn: () => Promise<{ error?: { message: string } | null }>): Promise<void> {
    const { error } = await fn()
    if (error) throw new Error(error.message)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signUp: (email, password) => run(() => auth.signUp(email, password)),
      signIn: (email, password) => run(() => auth.signIn(email, password)),
      signOut: () => run(() => auth.signOut()),
      resetPassword: (email) => run(() => auth.resetPassword(email)),
    }),
    [user, session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}