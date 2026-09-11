import { useState } from 'react'
import { AlertCircle, Check, Smile, Trash2 } from 'lucide-react'
import { Avatar } from '../../shared/ui/avatar'
import { Button } from '../../shared/ui/button'
import { ImageLightbox } from '../../shared/ui/image-lightbox'
import { cn } from '../../shared/lib/utils'
import { formatTime } from '../../shared/lib/date'
import { useSignedUrl } from '../hooks/use-signed-url'
import { ReactionPicker } from './reaction-picker'
import { ReactionRow } from './reaction-row'
import type { MessageWithMeta } from '../../shared/types/database'

interface MessageBubbleProps {
  message: MessageWithMeta
  currentUserId: string
  isGroup: boolean
  onDelete: (messageId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => void
  onRetry?: () => void
}

export function MessageBubble({
  message,
  currentUserId,
  isGroup,
  onDelete,
  onToggleReaction,
  onRetry,
}: MessageBubbleProps) {
  const own = message.sender_id === currentUserId
  const [pickerOpen, setPickerOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const imageUrl = useSignedUrl(message.attachment?.storage_path)

  if (message.is_deleted) {
    return (
      <div className={cn('flex px-1 py-1', own ? 'justify-end' : 'justify-start')}>
        <span className="rounded-2xl bg-muted px-3 py-2 text-sm italic text-muted-foreground">
          Message deleted
        </span>
      </div>
    )
  }

  return (
    <div className={cn('group flex gap-2 px-1 py-1', own ? 'flex-row-reverse' : 'flex-row')}>
      {!own && <Avatar name={message.sender.display_name} src={message.sender.avatar_url} size="sm" />}
      <div className={cn('flex max-w-[75%] flex-col', own ? 'items-end' : 'items-start')}>
        {!own && isGroup && (
          <span className="mb-0.5 ml-1 text-xs text-muted-foreground">{message.sender.display_name}</span>
        )}

        <div className={cn('relative flex items-center gap-1', own ? 'flex-row-reverse' : 'flex-row')}>
          <div
            className={cn(
              'rounded-2xl border px-3 py-2 text-sm',
              own ? 'rounded-br-sm border-primary/20 bg-primary text-primary-foreground' : 'rounded-bl-sm border-border bg-panel',
              message.status === 'failed' && 'border-destructive',
            )}
          >
            {imageUrl && (
              <button type="button" onClick={() => setLightboxOpen(true)} className="block">
                <img src={imageUrl} alt={`Image from ${message.sender.display_name}`} className="max-h-80 rounded-lg object-cover" />
              </button>
            )}
            {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          </div>

          <div className="flex opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Add reaction"
                onClick={() => setPickerOpen((open) => !open)}
              >
                <Smile className="h-3.5 w-3.5" />
              </Button>
              {pickerOpen && (
                <div className={cn('absolute z-20 mt-1', own ? 'right-0' : 'left-0')}>
                  <ReactionPicker
                    onPick={(emoji) => {
                      onToggleReaction(message.id, emoji)
                      setPickerOpen(false)
                    }}
                  />
                </div>
              )}
            </div>
            {own && (
              <Button variant="ghost" size="icon-xs" aria-label="Delete message" onClick={() => onDelete(message.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <ReactionRow
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggle={(emoji) => onToggleReaction(message.id, emoji)}
        />

        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="tabular-nums">{formatTime(message.created_at)}</span>
          {own && message.status === 'sending' && <span>• sending…</span>}
          {own && message.status === 'sent' && <Check className="h-3 w-3" aria-label="Sent" />}
          {own && message.status === 'failed' && (
            <button type="button" onClick={onRetry} className="flex items-center gap-0.5 text-destructive">
              <AlertCircle className="h-3 w-3" /> Failed — retry
            </button>
          )}
        </div>
      </div>

      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        src={imageUrl}
        alt={`Image from ${message.sender.display_name}`}
      />
    </div>
  )
}
