import { supabase } from '../../shared/lib/supabase/client'
import type { ConversationMediaItem } from '../../shared/types/database'

export async function updateConversation(
  conversationId: string,
  changes: { title?: string; imagePath?: string },
): Promise<void> {
  const { error } = await supabase.rpc('update_conversation', {
    p_conversation: conversationId,
    p_title: changes.title ?? null,
    p_image_path: changes.imagePath ?? null,
  })
  if (error) throw new Error(error.message)
}

interface MediaRow {
  id: string
  storage_path: string
  created_at: string
  messages: { sender_id: string } | { sender_id: string }[] | null
}

export async function fetchConversationMedia(
  conversationId: string,
): Promise<ConversationMediaItem[]> {
  const { data, error } = await supabase
    .from('attachments')
    .select('id, storage_path, created_at, messages!inner(sender_id, conversation_id)')
    .eq('messages.conversation_id', conversationId)
    .like('mime_type', 'image/%')
    .order('created_at', { ascending: false })
    .limit(60)
  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as MediaRow[]).map((row) => {
    const message = Array.isArray(row.messages) ? row.messages[0] : row.messages
    return {
      id: row.id,
      storage_path: row.storage_path,
      created_at: row.created_at,
      sender_id: message?.sender_id ?? '',
    }
  })
}
