// ConversationItem — avatar(+presence dot), title, preview w/ sender prefix, time, unread badge (brief A5/B7)
import { Avatar } from '../../shared/ui/avatar'
import { UnreadBadge } from '../../shared/ui/badge'
import { cn } from '../../shared/lib/utils'
import { useMediaQuery } from '../../shared/hooks/use-media-query'
import { BREAKPOINTS } from '../../shared/constants/breakpoints'
import { formatRelativeTime } from '../../shared/lib/date'
import type { MockConversation } from '../mock-conversations'

export interface ConversationItemProps {
  conversation: MockConversation
  active?: boolean
}

function titleOf(c: MockConversation) {
  if (c.type === 'group' && c.title) return c.title
  if (c.type === 'direct') {
    const other = c.participantNames.find((n) => n !== 'Guest')
    return other ?? 'Unknown'
  }
  return c.title ?? 'Group'
}

function previewText(c: MockConversation) {
  if (c.isTyping) return '…is typing'
  if (c.latestPreview.startsWith('[Image]')) return '[Image]'
  return c.latestPreview
}

export function ConversationItem({ conversation, active }: ConversationItemProps) {
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.mobile}px)`, {})
  const unread = conversation.unreadCount > 0
  const senderPrefix = conversation.type === 'group' && !conversation.isTyping ? 'You: ' : ''
  const otherName =
    conversation.type === 'direct' ? conversation.participantNames.find((n) => n !== 'Guest') : undefined

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open conversation ${titleOf(conversation)}`}
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted',
        active && 'bg-cyan/15 hover:bg-cyan/20',
        isDesktop && conversation.type === 'direct' && 'grayscale group-hover:grayscale-0',
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-cyan" />}
      <div className="relative shrink-0">
        <Avatar name={titleOf(conversation)} src={conversation.image_url} size="lg" />
        {unread && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-panel bg-cyan" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="truncate font-semibold text-foreground">{titleOf(conversation)}</span>
          <span className="ml-2 shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatRelativeTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', unread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {conversation.isTyping ? (
              <span className="flex items-center gap-1">
                <span className="text-xs italic">…is typing</span>
              </span>
            ) : (
              <>
                {otherName && <span className="font-medium text-foreground">{otherName}: </span>}
                {senderPrefix}
                {previewText(conversation)}
              </>
            )}
          </span>
          <UnreadBadge count={conversation.unreadCount} />
        </div>
      </div>
    </div>
  )
}