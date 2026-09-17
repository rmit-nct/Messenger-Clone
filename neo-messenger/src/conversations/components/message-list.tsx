import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { MessageBubble, DateSeparator, UnreadDivider, TypingIndicator } from '../../messaging'
import { Skeleton } from '../../shared/ui/skeleton'
import { EmptyState } from '../../shared/ui/empty-state'
import { ErrorState } from '../../shared/ui/error-state'
import { formatDaySeparator } from '../../shared/lib/date'
import type { Member, MessageWithMeta } from '../../shared/types/database'
import { JumpToUnread } from './jump-to-unread'

interface MessageListProps {
  messages: MessageWithMeta[]
  currentUserId: string
  isGroup: boolean
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  typingUsers: Member[]
  lastReadAt: string
  onRefetch: () => void
  onDelete: (messageId: string) => void
  onDiscard: (messageId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => void
  onRetry: (message: MessageWithMeta) => void
}

export function MessageList({
  messages,
  currentUserId,
  isGroup,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  typingUsers,
  lastReadAt,
  onRefetch,
  onDelete,
  onDiscard,
  onToggleReaction,
  onRetry,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const firstUnreadId = useMemo(
    () => messages.find((m) => m.created_at > lastReadAt && m.sender_id !== currentUserId)?.id,
    [messages, lastReadAt, currentUserId],
  )
  const dividerIndex = firstUnreadId ? messages.findIndex((m) => m.id === firstUnreadId) : -1
  const [pendingNew, setPendingNew] = useState(0)
  const lastMessageIdRef = useRef<string | undefined>(undefined)
  const firstMessageIdRef = useRef<string | undefined>(undefined)
  const pendingScrollHeightRef = useRef<number | null>(null)

  useEffect(() => {
    const sentinel = topRef.current
    if (!sentinel || !hasNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        const el = scrollRef.current
        if (el) pendingScrollHeightRef.current = el.scrollHeight
        fetchNextPage()
      }
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const lastId = messages[messages.length - 1]?.id
    const firstId = messages[0]?.id
    const previousLast = lastMessageIdRef.current
    const previousFirst = firstMessageIdRef.current

    if (lastId !== undefined && previousLast === undefined) {
      el.scrollTop = el.scrollHeight
      setPendingNew(0)
    } else if (lastId !== undefined && previousLast !== undefined && lastId !== previousLast) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150
      if (nearBottom || messages.length <= 1) {
        el.scrollTop = el.scrollHeight
        setPendingNew(0)
      } else {
        setPendingNew((count) => count + 1)
      }
    } else if (firstId !== undefined && previousFirst !== undefined && firstId !== previousFirst) {
      const prevHeight = pendingScrollHeightRef.current
      if (prevHeight !== null) {
        el.scrollTop += el.scrollHeight - prevHeight
        pendingScrollHeightRef.current = null
      }
    }

    lastMessageIdRef.current = lastId
    firstMessageIdRef.current = firstId
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className={i % 2 ? 'ml-auto h-12 w-2/5' : 'h-12 w-1/2'} />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState title="Couldn't load messages" onRetry={onRefetch} className="flex-1" />
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-7 w-7" />}
        title="Say hello 👋"
        description="This is the start of the conversation."
        className="flex-1"
      />
    )
  }

  return (
    <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-3 py-4">
      <div ref={topRef} aria-hidden="true" />
      {isFetchingNextPage && <p className="py-2 text-center text-xs text-muted-foreground">Loading older messages…</p>}

      {messages.map((message, index) => {
        const day = formatDaySeparator(message.created_at)
        const previousDay = index > 0 ? formatDaySeparator(messages[index - 1].created_at) : ''
        const showDay = day !== previousDay
        return (
          <div key={message.id}>
            {showDay && <DateSeparator label={day} />}
            {index === dividerIndex && <UnreadDivider />}
            <MessageBubble
              message={message}
              currentUserId={currentUserId}
              isGroup={isGroup}
              onDelete={onDelete}
              onDiscard={onDiscard}
              onToggleReaction={onToggleReaction}
              onRetry={() => onRetry(message)}
            />
          </div>
        )
      })}

      <TypingIndicator users={typingUsers} />
      <JumpToUnread
        count={pendingNew}
        onClick={() => {
          const el = scrollRef.current
          if (el) el.scrollTop = el.scrollHeight
          setPendingNew(0)
        }}
      />
    </div>
  )
}
