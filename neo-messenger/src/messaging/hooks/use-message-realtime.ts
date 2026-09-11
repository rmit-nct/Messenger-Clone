import { useEffect } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { supabase } from '../../shared/lib/supabase/client'
import { inboxKey, messagesKey } from '../../shared/lib/query-keys'
import type { Member, MessageWithMeta } from '../../shared/types/database'

interface Options {
  conversationId: string
  currentUserId: string
  members: Member[]
}

type MessagePages = InfiniteData<{ messages: MessageWithMeta[]; hasMore: boolean }>

interface MessageRealtimeRow {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  is_deleted: boolean
  edited_at: string | null
  created_at: string
}

interface AttachmentRealtimeRow {
  message_id: string
  storage_path: string
  mime_type: string
  size: number
}

interface ReactionRealtimeRow {
  message_id: string
  user_id: string
  emoji: string
}

export function useMessageRealtime({ conversationId, currentUserId, members }: Options) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId) return

    const patchMessages = (updater: (messages: MessageWithMeta[]) => MessageWithMeta[]) => {
      queryClient.setQueryData<MessagePages>(messagesKey(conversationId), (existing) => {
        if (!existing) return existing
        const flat = updater(existing.pages.flatMap((page) => page.messages))
        return {
          ...existing,
          pages: [
            {
              messages: flat,
              hasMore: existing.pages[existing.pages.length - 1]?.hasMore ?? false,
            },
          ],
        }
      })
    }

    const invalidateInbox = () => queryClient.invalidateQueries({ queryKey: inboxKey })

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as unknown as MessageRealtimeRow
          const sender = members.find((m) => m.id === row.sender_id) ?? {
            id: row.sender_id,
            display_name: 'Unknown',
            avatar_url: null,
          }
          const incoming: MessageWithMeta = {
            id: row.id,
            conversation_id: row.conversation_id,
            sender_id: row.sender_id,
            content: row.content,
            is_deleted: row.is_deleted,
            edited_at: row.edited_at,
            created_at: row.created_at,
            status: 'sent',
            sender,
            attachment: null,
            reactions: [],
          }
          patchMessages((messages) => {
            const withoutTemp = messages.filter(
              (m) =>
                !(
                  m.status === 'sending' &&
                  m.sender_id === currentUserId &&
                  m.content === row.content
                ),
            )
            if (withoutTemp.some((m) => m.id === incoming.id)) {
              return withoutTemp.map((m) => (m.id === incoming.id ? incoming : m))
            }
            return [...withoutTemp, incoming]
          })
          invalidateInbox()
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as unknown as MessageRealtimeRow
          patchMessages((messages) =>
            messages.map((m) => (m.id === row.id ? { ...m, is_deleted: row.is_deleted, edited_at: row.edited_at } : m)),
          )
          invalidateInbox()
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attachments' },
        (payload) => {
          const row = payload.new as unknown as AttachmentRealtimeRow
          patchMessages((messages) =>
            messages.map((m) =>
              m.id === row.message_id
                ? { ...m, attachment: { storage_path: row.storage_path, mime_type: row.mime_type, size: row.size } }
                : m,
            ),
          )
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const row = (payload.new ?? payload.old) as unknown as ReactionRealtimeRow
          patchMessages((messages) =>
            messages.map((m) => {
              if (m.id !== row.message_id) return m
              const others = m.reactions.filter((r) => r.user_id !== row.user_id)
              if (payload.eventType === 'DELETE') return { ...m, reactions: others }
              return { ...m, reactions: [...others, { user_id: row.user_id, emoji: row.emoji }] }
            }),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId, members, queryClient])
}
