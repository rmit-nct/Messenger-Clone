import { supabase } from './client'
import { PRESENCE_CHANNEL, conversationChannel } from '../../constants/realtime'

export function channelForConversation(conversationId: string) {
  return supabase.channel(conversationChannel(conversationId))
}

export function onlinePresenceChannel(userId: string) {
  return supabase.channel(PRESENCE_CHANNEL, { config: { presence: { key: userId } } })
}
