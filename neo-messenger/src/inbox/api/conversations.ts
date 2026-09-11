import { supabase } from '../../shared/lib/supabase/client'
import type { InboxConversation } from '../../shared/types/database'

interface InboxRow {
  conversation_id: string
  type: InboxConversation['type']
  title: string | null
  image_url: string | null
  last_message_at: string
  last_message_preview: string | null
  last_message_sender: string | null
  unread_count: number
  member_ids: string[] | null
  other_user_id: string | null
  other_display_name: string | null
  other_avatar_url: string | null
}

export async function fetchInbox(): Promise<InboxConversation[]> {
  const { data, error } = await supabase.rpc('get_inbox')
  if (error) throw new Error(error.message)
  return ((data ?? []) as InboxRow[]).map((row) => ({
    id: row.conversation_id,
    type: row.type,
    title: row.title,
    image_url: row.image_url,
    last_message_at: row.last_message_at,
    last_message_preview: row.last_message_preview,
    last_message_sender: row.last_message_sender,
    unread_count: Number(row.unread_count ?? 0),
    member_ids: row.member_ids ?? [],
    other_user: row.other_user_id
      ? {
          id: row.other_user_id,
          display_name: row.other_display_name ?? 'Unknown',
          avatar_url: row.other_avatar_url,
        }
      : null,
  }))
}
