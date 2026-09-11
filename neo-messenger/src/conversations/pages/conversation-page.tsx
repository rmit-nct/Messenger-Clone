import { useState } from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../shared/ui/button'
import { Avatar } from '../../shared/ui/avatar'
import { ErrorState } from '../../shared/ui/error-state'
import { MessageComposer, usePresence, useTyping } from '../../messaging'
import { useConversation } from '../hooks/use-conversation'
import { MessageList } from '../components/message-list'

export function ConversationPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const conversation = useConversation(id)
  const { typingUsers, notifyTyping } = useTyping(id, conversation.currentMember)
  const { onlineUserIds } = usePresence()
  const [composerError, setComposerError] = useState<string | null>(null)

  if (conversation.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <ErrorState
          title="Conversation not found"
          description="It may have been deleted or you are not a member."
          onRetry={() => navigate('/inbox')}
        />
      </div>
    )
  }

  const title =
    conversation.conversation?.type === 'group'
      ? conversation.conversation.title ?? 'Group'
      : conversation.members.find((m) => m.id !== conversation.currentUser?.id)?.display_name ?? 'Direct message'

  const avatarSrc =
    conversation.conversation?.image_url ??
    conversation.members.find((m) => m.id !== conversation.currentUser?.id)?.avatar_url ??
    null

  const onlineCount = conversation.members.filter((m) => onlineUserIds.has(m.id)).length

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-panel px-3 py-2">
        <Button variant="ghost" size="icon" aria-label="Back to inbox" onClick={() => navigate('/inbox')} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar name={title} src={avatarSrc} size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {conversation.conversation?.type === 'group' ? (
              <>
                <Users className="h-3 w-3" aria-hidden="true" />
                {conversation.members.length} members
                {onlineCount > 0 && <span>· {onlineCount} online</span>}
              </>
            ) : onlineCount > 0 ? (
              <span>Online</span>
            ) : (
              <span>Offline</span>
            )}
          </p>
        </div>
      </header>

      <MessageList
        messages={conversation.messages}
        currentUserId={conversation.currentUser?.id ?? ''}
        isGroup={conversation.conversation?.type === 'group'}
        isLoading={conversation.isLoading}
        isError={conversation.isError}
        hasNextPage={conversation.hasNextPage}
        isFetchingNextPage={conversation.isFetchingNextPage}
        fetchNextPage={conversation.fetchNextPage}
        typingUsers={typingUsers}
        lastReadAt={conversation.lastReadAt}
        onRefetch={conversation.refetch}
        onDelete={conversation.deleteMessage}
        onToggleReaction={conversation.toggleReaction}
        onRetry={(message) => {
          if (message.content) void conversation.sendText(message.content)
        }}
      />

      {composerError && (
        <p role="alert" className="px-3 pb-1 text-xs text-destructive">
          {composerError}
        </p>
      )}
      <MessageComposer
        onSendText={conversation.sendText}
        onSendImage={conversation.sendImage}
        notifyTyping={notifyTyping}
        onError={setComposerError}
      />
    </div>
  )
}
