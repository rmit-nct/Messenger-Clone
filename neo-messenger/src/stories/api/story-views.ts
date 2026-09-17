import { supabase } from '../../shared/lib/supabase/client'
import type { Member } from '../../shared/types/database'

interface ViewerRow {
  viewer_id: string
  viewed_at: string
  profiles: Member | Member[] | null
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null
  return value ?? null
}

export async function recordStoryView(storyId: string, viewerId: string): Promise<void> {
  const { error } = await supabase
    .from('story_views')
    .upsert(
      { story_id: storyId, viewer_id: viewerId },
      { onConflict: 'story_id,viewer_id', ignoreDuplicates: true },
    )
  if (error) throw new Error(error.message)
}

export async function fetchStoryViewers(storyId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('story_views')
    .select('viewer_id, viewed_at, profiles!story_views_viewer_id_fkey(id, display_name, avatar_url)')
    .eq('story_id', storyId)
    .order('viewed_at', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as ViewerRow[])
    .map((row) => firstOf(row.profiles))
    .filter((member): member is Member => member !== null)
}
