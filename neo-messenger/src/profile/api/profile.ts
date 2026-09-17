import { supabase } from '../../shared/lib/supabase/client'
import type { Profile } from '../../shared/types/database'

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profile not found')
  return data as Profile
}

export async function updateProfile(
  userId: string,
  changes: { display_name?: string; avatar_url?: string },
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Profile
}