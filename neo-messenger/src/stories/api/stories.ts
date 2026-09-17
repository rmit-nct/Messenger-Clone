import { supabase } from '../../shared/lib/supabase/client'
import type { ActiveStoryAuthor, Member, Story, StoryMedia, UserStories } from '../../shared/types/database'

interface StoryRow {
  id: string
  user_id: string
  image_path: string
  caption: string | null
  created_at: string
  expire_at: string
  profiles: Member | Member[] | null
  story_views: { viewer_id: string }[] | null
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null
  return value ?? null
}

function mapStory(row: StoryRow, currentUserId: string): StoryMedia {
  return {
    id: row.id,
    imagePath: row.image_path,
    caption: row.caption,
    createdAt: row.created_at,
    expireAt: row.expire_at,
    seen: (row.story_views ?? []).some((view) => view.viewer_id === currentUserId),
  }
}

const STORY_SELECT =
  'id, user_id, image_path, caption, created_at, expire_at, profiles!stories_user_id_fkey(id, display_name, avatar_url), story_views(viewer_id)'

export async function fetchActiveStories(currentUserId: string): Promise<ActiveStoryAuthor[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(STORY_SELECT)
    .gt('expire_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(200)
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as unknown as StoryRow[]
  const byAuthor = new Map<string, ActiveStoryAuthor>()
  for (const row of rows) {
    const profile = firstOf(row.profiles) ?? {
      id: row.user_id,
      display_name: 'Unknown',
      avatar_url: null,
    }
    const story = mapStory(row, currentUserId)
    const existing = byAuthor.get(row.user_id)
    if (existing) {
      existing.stories.push(story)
    } else {
      byAuthor.set(row.user_id, {
        userId: row.user_id,
        name: profile.display_name,
        avatarUrl: profile.avatar_url,
        stories: [story],
        hasUnseen: false,
      })
    }
  }

  const authors = [...byAuthor.values()]
  for (const author of authors) {
    author.hasUnseen = author.stories.some((story) => !story.seen)
  }
  authors.sort((a, b) => {
    if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1
    const aLatest = a.stories[a.stories.length - 1]?.createdAt ?? ''
    const bLatest = b.stories[b.stories.length - 1]?.createdAt ?? ''
    return aLatest < bLatest ? 1 : aLatest > bLatest ? -1 : 0
  })
  return authors
}

export async function fetchUserStories(
  userId: string,
  currentUserId: string,
): Promise<UserStories> {
  const { data, error } = await supabase
    .from('stories')
    .select(STORY_SELECT)
    .eq('user_id', userId)
    .gt('expire_at', new Date().toISOString())
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as unknown as StoryRow[]
  const profile = rows.length > 0 ? firstOf(rows[0].profiles) : null
  return {
    userId,
    name: profile?.display_name ?? 'Story',
    avatarUrl: profile?.avatar_url ?? null,
    stories: rows.map((row) => mapStory(row, currentUserId)),
  }
}

export async function createStory(
  userId: string,
  imagePath: string,
  caption: string | null,
): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .insert({ user_id: userId, image_path: imagePath, caption })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Story
}

export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase.from('stories').delete().eq('id', storyId)
  if (error) throw new Error(error.message)
}
