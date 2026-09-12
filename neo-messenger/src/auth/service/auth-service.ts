// Auth service — thin wrappers over Supabase Auth (task 1.1)
// Session storage + token refresh are handled internally by supabase-js; we only call the API.
import { supabase } from '../../shared/lib/supabase/client'

export async function signUp(email: string, password: string) {
  // metadata.display_name feeds the on-register profile trigger (01_profiles.sql)
  return supabase.auth.signUp({ email, password, options: { data: { display_name: email.split('@')[0] } } })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword })
}

export async function getSession() {
  return supabase.auth.getSession()
}