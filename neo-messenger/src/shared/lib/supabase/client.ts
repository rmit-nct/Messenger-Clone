// Supabase singleton client. Session storage + auto token refresh are handled internally
// by supabase-js (localStorage persistence). All feature api/ modules import this.
import { createClient } from '@supabase/supabase-js'
import { env } from '../env'

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})