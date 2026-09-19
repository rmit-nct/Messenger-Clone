import { useEffect, useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth'
import { conversationKey, inboxKey, messagesKey } from '../../shared/lib/query-keys'
import { randomId } from '../../shared/lib/uuid'
import { MESSAGES_PAGE_SIZE } from '../../shared/constants/limits'
import type { Member, MessageWithMeta } from '../../shared/types/database'
import {
  deleteMessage as deleteMessageApi,
  fetchMessages,
  sendImageMessage,
  sendTextMessage,
} from '../api/messages'
import { fetchConversationMeta, markConversationRead } from '../api/members'
import { toggleReaction as toggleReactionApi, useMessageRealtime } from '../../messaging'

export function useConversation(conversationId: string) {
  const { user } = useAuth()
  const currentUserId = user?.id ?? ''
  const queryClient = useQueryClient()

  const metaQuery = useQuery({
    queryKey: conversationKey(conversationId),
    queryFn: () => fetchConversationMeta(conversationId, currentUserId),
    enabled: !!conversationId,
  })

  const messagesQuery = useInfiniteQuery({
    queryKey: messagesKey(conversationId),
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId, { before: pageParam, limit: MESSAGES_PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.messages[lastPage.messages.length - 1]?.created_at : undefined,
    enabled: !!conversationId,
  })

  const members = useMemo(() => metaQuery.data?.members ?? [], [metaQuery.data])
  const currentMember: Member =
    members.find((m) => m.id === currentUserId) ?? {
      id: currentUserId,
      display_name: 'You',
      avatar_url: null,
    }

  const flatMessages = messagesQuery.data?.pages.flatMap((p) => p.messages) ?? []
  const messages = [...flatMessages].sort((a, b) =>
    a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
  )
  const lastMessageId = messages.length ? messages[messages.length - 1].id : null

  useEffect(() => {
    if (!currentUserId || !lastMessageId) return
    void markConversationRead(conversationId, currentUserId).then(() => {
      void queryClient.invalidateQueries({ queryKey: inboxKey })
    })
  }, [conversationId, currentUserId, lastMessageId, queryClient])

  useMessageRealtime({ conversationId, currentUserId, members })

  const updateMessages = (updater: (messages: MessageWithMeta[]) => MessageWithMeta[]) => {
    queryClient.setQueryData<{ pages: { messages: MessageWithMeta[]; hasMore: boolean }[]; pageParams: unknown[] }>(
      messagesKey(conversationId),
      (existing) => {
        if (!existing) return existing
        const flat = updater(existing.pages.flatMap((p) => p.messages))
        const sorted = [...flat].sort((a, b) =>
          a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0,
        )
        return { ...existing, pages: [{ messages: sorted, hasMore: existing.pages[existing.pages.length - 1]?.hasMore ?? false }] }
      },
    )
  }

  const markRead = () => {
    if (!currentUserId) return
    void markConversationRead(conversationId, currentUserId).then(() => {
      void queryClient.invalidateQueries({ queryKey: inboxKey })
      void queryClient.invalidateQueries({ queryKey: conversationKey(conversationId) })
    })
  }

  const sendText = async (content: string) => {
    const tempId = `temp-${randomId()}`
    const optimistic: MessageWithMeta = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      is_deleted: false,
      edited_at: null,
      created_at: new Date().toISOString(),
      status: 'sending',
      sender: currentMember,
      attachment: null,
      reactions: [],
    }
    updateMessages((messages) => [...messages, optimistic])
    try {
      const saved = await sendTextMessage(conversationId, currentUserId, content)
      updateMessages((messages) => messages.map((m) => (m.id === tempId ? saved : m)))
      void queryClient.invalidateQueries({ queryKey: inboxKey })
    } catch (err) {
      updateMessages((messages) =>
        messages.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)),
      )
      throw err
    }
  }

  const sendImage = async (file: File, onProgress?: (percent: number) => void) => {
    const tempId = `temp-${randomId()}`
    const optimistic: MessageWithMeta = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: null,
      is_deleted: false,
      edited_at: null,
      created_at: new Date().toISOString(),
      status: 'sending',
      sender: currentMember,
      attachment: { storage_path: '', mime_type: file.type, size: file.size },
      reactions: [],
    }
    updateMessages((messages) => [...messages, optimistic])
    try {
      const saved = await sendImageMessage(conversationId, currentUserId, file, onProgress)
      updateMessages((messages) => messages.map((m) => (m.id === tempId ? saved : m)))
      void queryClient.invalidateQueries({ queryKey: inboxKey })
    } catch (err) {
      updateMessages((messages) =>
        messages.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)),
      )
      throw err
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessageApi(messageId),
    onMutate: (messageId) => {
      updateMessages((messages) =>
        messages.map((m) => (m.id === messageId ? { ...m, is_deleted: true } : m)),
      )
    },
  })

  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      toggleReactionApi(messageId, currentUserId, emoji),
    onMutate: ({ messageId, emoji }) => {
      updateMessages((messages) =>
        messages.map((m) => {
          if (m.id !== messageId) return m
          const mine = m.reactions.find((r) => r.user_id === currentUserId)
          const withoutMine = m.reactions.filter((r) => r.user_id !== currentUserId)
          const reactions = mine?.emoji === emoji ? withoutMine : [...withoutMine, { user_id: currentUserId, emoji }]
          return { ...m, reactions }
        }),
      )
    },
  })

  const discardMessage = (messageId: string) => {
    updateMessages((messages) => messages.filter((m) => m.id !== messageId))
  }

  return {
    conversation: metaQuery.data?.conversation ?? null,
    members,
    currentUser: user,
    currentMember,
    messages,
    isLoading: metaQuery.isLoading || messagesQuery.isLoading,
    isError: metaQuery.isError || messagesQuery.isError,
    refetch: () => {
      void metaQuery.refetch()
      void messagesQuery.refetch()
    },
    hasNextPage: messagesQuery.hasNextPage ?? false,
    fetchNextPage: () => void messagesQuery.fetchNextPage(),
    isFetchingNextPage: messagesQuery.isFetchingNextPage,
    sendText,
    sendImage,
    deleteMessage: (messageId: string) => deleteMutation.mutate(messageId),
    discardMessage,
    toggleReaction: (messageId: string, emoji: string) => reactMutation.mutate({ messageId, emoji }),
    markRead,
    lastReadAt: metaQuery.data?.lastReadAt ?? new Date(0).toISOString(),
  }
}
