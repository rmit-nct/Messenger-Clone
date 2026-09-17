import { supabase } from '../supabase/client'
import { USERS_SEARCH_LIMIT } from '../../constants/limits'
import type { Member } from '../../types/database'

export async function searchUsers(query: string, excludeId: string): Promise<Member[]> {
  const term = query.trim()
  let request = supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .neq('id', excludeId)
    .order('display_name', { ascending: true })
    .limit(USERS_SEARCH_LIMIT)
  if (term) request = request.ilike('display_name', `%${term}%`)
  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []) as Member[]
}
