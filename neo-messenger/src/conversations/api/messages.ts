import { supabase } from '../../shared/lib/supabase/client'
import { MESSAGES_PAGE_SIZE } from '../../shared/constants/limits'
import { uploadMessageImage } from '../../shared/lib/api/uploads'
import type { Member, MessageWithMeta } from '../../shared/types/database'

const MESSAGE_SELECT = `
  id, conversation_id, sender_id, content, is_deleted, edited_at, created_at,
  sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url),
  attachments(storage_path, mime_type, size),
  message_reactions(user_id, emoji)
`

interface AttachmentRow {
  storage_path: string
  mime_type: string
  size: number
}

interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  is_deleted: boolean
  edited_at: string | null
  created_at: string
  sender: Member | Member[] | null
  attachments: AttachmentRow | AttachmentRow[] | null
  message_reactions: { user_id: string; emoji: string }[] | null
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null
  return value ?? null
}

function mapMessage(row: MessageRow): MessageWithMeta {
  const attachment = firstOf(row.attachments)
  const sender = firstOf(row.sender)
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_id: row.sender_id,
    content: row.content,
    is_deleted: row.is_deleted,
    edited_at: row.edited_at,
    created_at: row.created_at,
    status: 'sent',
    sender: sender ?? { id: row.sender_id, display_name: 'Unknown', avatar_url: null },
    attachment: attachment
      ? { storage_path: attachment.storage_path, mime_type: attachment.mime_type, size: attachment.size }
      : null,
    reactions: (row.message_reactions as { user_id: string; emoji: string }[]) ?? [],
  }
}

export async function fetchMessages(
  conversationId: string,
  options: { before?: string; limit?: number } = {},
): Promise<{ messages: MessageWithMeta[]; hasMore: boolean }> {
  const limit = options.limit ?? MESSAGES_PAGE_SIZE
  let request = supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (options.before) request = request.lt('created_at', options.before)
  const { data, error } = await request
  if (error) throw new Error(error.message)
  const messages = ((data ?? []) as unknown as MessageRow[]).map(mapMessage)
  return { messages, hasMore: messages.length === limit }
}

export async function fetchMessageById(id: string): Promise<MessageWithMeta | null> {
  const { data, error } = await supabase.from('messages').select(MESSAGE_SELECT).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapMessage(data as unknown as MessageRow) : null
}

export async function sendTextMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<MessageWithMeta> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select(MESSAGE_SELECT)
    .single()
  if (error) throw new Error(error.message)
  return mapMessage(data as unknown as MessageRow)
}

export async function sendImageMessage(
  conversationId: string,
  senderId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MessageWithMeta> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  const messageId = (data as { id: string }).id

  try {
    const path = await uploadMessageImage(conversationId, file, onProgress)
    const { error: attachError } = await supabase
      .from('attachments')
      .insert({ message_id: messageId, storage_path: path, mime_type: file.type, size: file.size })
    if (attachError) throw new Error(attachError.message)
    const message = await fetchMessageById(messageId)
    if (!message) throw new Error('Message not found after upload')
    return message
  } catch (err) {
    await supabase.from('messages').update({ is_deleted: true }).eq('id', messageId)
    throw err
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from('messages').update({ is_deleted: true }).eq('id', messageId)
  if (error) throw new Error(error.message)
}
