// ConversationItem — avatar(+presence dot), title, preview, time, unread badge.
// `compact` = icon-rail mode: avatar alone (title via tooltip/aria), no text.
import { Avatar } from '../../shared/ui/avatar'
import { UnreadBadge } from '../../shared/ui/badge'
import { cn } from '../../shared/lib/utils'
import { formatRelativeTime } from '../../shared/lib/date'
import type { MockConversation } from '../mock-conversations'

export interface ConversationItemProps {
  conversation: MockConversation
  active?: boolean
  compact?: boolean
}

function titleOf(c: MockConversation) {
  if (c.type === 'group' && c.title) return c.title
  const other = c.participantNames.find((n) => n !== 'Guest')
  return other ?? c.title ?? 'Group'
}

export function ConversationItem({ conversation, active, compact }: ConversationItemProps) {
  const unread = conversation.unreadCount > 0
  const title = titleOf(conversation)

  if (compact) {
    return (
      <button
        type="button"
        tabIndex={0}
        title={title}
        aria-label={`Open conversation ${title}`}
        className={cn(
          'relative flex items-center justify-center rounded-full hover:bg-foreground/10',
          active && 'bg-cyan/15',
        )}
      >
        <div className="relative shrink-0">
          <Avatar name={title} src={conversation.image_url} size="lg" />
          {unread && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-panel bg-cyan" />
          )}
        </div>
      </button>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open conversation ${title}`}
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 rounded-lg bg-foreground/10 px-3 py-2 transition-colors hover:bg-muted',
        active && 'bg-cyan/10 hover:bg-cyan/15 dark:bg-cyan/15 dark:hover:bg-cyan/20',
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-cyan/80 dark:bg-cyan" />
      )}
      <div className="relative shrink-0">
        <Avatar name={title} src={conversation.image_url} size="lg" />
        {unread && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-panel bg-cyan" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="truncate font-semibold text-foreground">{title}</span>
          <span className="ml-2 shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatRelativeTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm',
              unread ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            {conversation.latestPreview}
          </span>
          <span className="shrink-0">
            <UnreadBadge count={conversation.unreadCount} />
          </span>
        </div>
      </div>
    </div>
  )
}