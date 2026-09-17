import { supabase } from '../../shared/lib/supabase/client'

export async function toggleReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  const { data, error } = await supabase
    .from('message_reactions')
    .select('emoji')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)

  if (data?.emoji === emoji) {
    const { error: deleteError } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
    if (deleteError) throw new Error(deleteError.message)
    return
  }

  const { error: upsertError } = await supabase
    .from('message_reactions')
    .upsert({ message_id: messageId, user_id: userId, emoji }, { onConflict: 'message_id,user_id' })
  if (upsertError) throw new Error(upsertError.message)
}
