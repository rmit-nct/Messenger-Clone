// ConversationList — ordered list with active/hover states + skeleton + empty (frame only; real query at 2.5)
import { mockConversations } from '../mock-conversations'
import { ConversationItem } from './conversation-item'

interface ConversationListProps {
  collapsed?: boolean
}

export function ConversationList({ collapsed = false }: ConversationListProps) {
  const conversations = mockConversations

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        {conversations.map((c) => (
          <ConversationItem key={c.id} conversation={c} compact />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2 md:p-3">
      {conversations.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          <p>No conversations yet</p>
          <p className="mt-1 text-xs">Start a conversation to begin</p>
        </div>
      ) : (
        conversations.map((c) => <ConversationItem key={c.id} conversation={c} />)
      )}
    </div>
  )
}

export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2" aria-busy="true" aria-label="Loading conversations">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg p-2">
          <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}