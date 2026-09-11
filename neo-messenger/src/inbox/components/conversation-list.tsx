import { useParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useConversationList } from '../hooks/use-conversation-list'
import { ConversationItem } from './conversation-item'
import { Skeleton } from '../../shared/ui/skeleton'
import { ErrorState } from '../../shared/ui/error-state'
import { EmptyState } from '../../shared/ui/empty-state'

interface ConversationListProps {
  collapsed?: boolean
}

export function ConversationList({ collapsed = false }: ConversationListProps) {
  const { id: activeId } = useParams()
  const { conversations, isLoading, isError, refetch } = useConversationList()
  const onlineUserIds = new Set<string>()

  if (isLoading) return <ConversationListSkeleton />
  if (isError) {
    return <ErrorState title="Couldn't load conversations" description="Check your connection and try again." onRetry={() => refetch()} />
  }
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-7 w-7" />}
        title="No conversations yet"
        description="Start a conversation to begin."
        className="py-10"
      />
    )
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        {conversations.map((c) => (
          <ConversationItem
            key={c.id}
            conversation={c}
            active={c.id === activeId}
            compact
            online={c.member_ids.some((m) => onlineUserIds.has(m))}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2 md:p-3">
      {conversations.map((c) => (
        <ConversationItem
          key={c.id}
          conversation={c}
          active={c.id === activeId}
          online={c.member_ids.some((m) => onlineUserIds.has(m))}
        />
      ))}
    </div>
  )
}

export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2" aria-busy="true" aria-label="Loading conversations">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-2">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
