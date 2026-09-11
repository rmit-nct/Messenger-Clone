import { Link } from 'react-router-dom'
import { Avatar } from '../../shared/ui/avatar'
import { UnreadBadge } from '../../shared/ui/badge'
import { cn } from '../../shared/lib/utils'
import { formatRelativeTime } from '../../shared/lib/date'
import type { InboxConversation } from '../../shared/types/database'

export interface ConversationItemProps {
  conversation: InboxConversation
  active?: boolean
  compact?: boolean
  online?: boolean
}

function titleOf(c: InboxConversation) {
  if (c.type === 'group') return c.title ?? 'Group'
  return c.other_user?.display_name ?? 'Direct message'
}

export function ConversationItem({ conversation, active, compact, online }: ConversationItemProps) {
  const unread = conversation.unread_count > 0
  const title = titleOf(conversation)
  const preview = conversation.last_message_preview ?? 'No messages yet'
  const avatarSrc = conversation.image_url ?? conversation.other_user?.avatar_url ?? null

  if (compact) {
    return (
      <Link
        to={`/conversation/${conversation.id}`}
        title={title}
        aria-label={`Open conversation ${title}`}
        className={cn('relative flex items-center justify-center rounded-full p-1 hover:bg-foreground/10', active && 'bg-cyan/15')}
      >
        <div className="relative shrink-0">
          <Avatar name={title} src={avatarSrc} size="lg" />
          {online && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-panel bg-emerald-500" />
          )}
          {unread && (
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-panel bg-cyan" />
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/conversation/${conversation.id}`}
      aria-label={`Open conversation ${title}`}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg bg-foreground/10 px-3 py-2 transition-colors hover:bg-muted',
        active && 'bg-cyan/10 hover:bg-cyan/15 dark:bg-cyan/15 dark:hover:bg-cyan/20',
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-cyan" />
      )}
      <div className="relative shrink-0">
        <Avatar name={title} src={avatarSrc} size="lg" />
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-panel bg-emerald-500" />
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
          <span className={cn('truncate text-sm', unread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {conversation.last_message_sender && conversation.type === 'group'
              ? `${conversation.last_message_sender}: ${preview}`
              : preview}
          </span>
          <span className="shrink-0">
            <UnreadBadge count={conversation.unread_count} />
          </span>
        </div>
      </div>
    </Link>
  )
}
