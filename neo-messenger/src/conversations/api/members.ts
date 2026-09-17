import { supabase } from '../../shared/lib/supabase/client'
import type { Conversation, ConversationMember, Member } from '../../shared/types/database'

export interface ConversationMeta {
  conversation: Conversation
  members: ConversationMember[]
  lastReadAt: string | null
}

interface MemberRow {
  user_id: string
  last_read_at: string
  is_admin: boolean
  profiles: Member | Member[] | null
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null
  return value ?? null
}

export async function fetchConversationMeta(
  conversationId: string,
  userId: string,
): Promise<ConversationMeta> {
  const [conversationResult, membersResult] = await Promise.all([
    supabase.from('conversations').select('*').eq('id', conversationId).maybeSingle(),
    supabase
      .from('conversation_members')
      .select('user_id, last_read_at, is_admin, profiles!conversation_members_user_id_fkey(id, display_name, avatar_url)')
      .eq('conversation_id', conversationId),
  ])
  if (conversationResult.error) throw new Error(conversationResult.error.message)
  if (membersResult.error) throw new Error(membersResult.error.message)
  if (!conversationResult.data) throw new Error('Conversation not found')

  const rows = (membersResult.data ?? []) as unknown as MemberRow[]
  const members = rows
    .map((row) => {
      const profile = firstOf(row.profiles)
      return profile ? { ...profile, is_admin: row.is_admin } : null
    })
    .filter((member): member is ConversationMember => member !== null)
  const lastReadAt = rows.find((row) => row.user_id === userId)?.last_read_at ?? null

  return { conversation: conversationResult.data as Conversation, members, lastReadAt }
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function addConversationMembers(
  conversationId: string,
  userIds: string[],
): Promise<void> {
  const { error } = await supabase.rpc('add_conversation_members', {
    p_conversation: conversationId,
    p_user_ids: userIds,
  })
  if (error) throw new Error(error.message)
}

export async function removeConversationMember(
  conversationId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.rpc('remove_conversation_member', {
    p_conversation: conversationId,
    p_user_id: userId,
  })
  if (error) throw new Error(error.message)
}

export async function setConversationAdmin(
  conversationId: string,
  userId: string,
  isAdmin: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('set_conversation_admin', {
    p_conversation: conversationId,
    p_user_id: userId,
    p_is_admin: isAdmin,
  })
  if (error) throw new Error(error.message)
}
