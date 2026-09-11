import { supabase } from '../../shared/lib/supabase/client'

export async function createDirectConversation(otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_direct_conversation', { other_user: otherUserId })
  if (error) throw new Error(error.message)
  return data as string
}

export async function createGroupConversation(input: {
  title: string
  memberIds: string[]
}): Promise<string> {
  const { data, error } = await supabase.rpc('create_group_conversation', {
    p_title: input.title,
    p_member_ids: input.memberIds,
  })
  if (error) throw new Error(error.message)
  return data as string
}
