import { supabase } from '../../shared/lib/supabase/client'
import type { Conversation, Member } from '../../shared/types/database'

export interface ConversationMeta {
  conversation: Conversation
  members: Member[]
}

interface MemberRow {
  user_id: string
  profiles: Member | Member[] | null
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null
  return value ?? null
}

export async function fetchConversationMeta(conversationId: string): Promise<ConversationMeta> {
  const [conversationResult, membersResult] = await Promise.all([
    supabase.from('conversations').select('*').eq('id', conversationId).maybeSingle(),
    supabase
      .from('conversation_members')
      .select('user_id, profiles!conversation_members_user_id_fkey(id, display_name, avatar_url)')
      .eq('conversation_id', conversationId),
  ])
  if (conversationResult.error) throw new Error(conversationResult.error.message)
  if (membersResult.error) throw new Error(membersResult.error.message)
  if (!conversationResult.data) throw new Error('Conversation not found')

  const members = ((membersResult.data ?? []) as unknown as MemberRow[])
    .map((row) => firstOf(row.profiles))
    .filter((member): member is Member => member !== null)

  return { conversation: conversationResult.data as Conversation, members }
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}
