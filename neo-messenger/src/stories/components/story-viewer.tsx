import { useRef } from 'react'
import { Trash2, X } from 'lucide-react'
import { Avatar } from '../../shared/ui/avatar'
import { Button } from '../../shared/ui/button'
import { formatRelativeTime } from '../../shared/lib/date'
import type { StoryMedia } from '../../shared/types/database'
import { StoryProgressBar } from './story-progress-bar'
import { StoryCaption } from './story-caption'

interface StoryViewerProps {
  authorName: string
  authorAvatarUrl: string | null
  stories: StoryMedia[]
  index: number
  progress: number
  imageUrl: string | null
  isOwner: boolean
  seenCount: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onPause: (paused: boolean) => void
  onOpenViewers: () => void
  onDelete: () => void
}

export function StoryViewer({
  authorName,
  authorAvatarUrl,
  stories,
  index,
  progress,
  imageUrl,
  isOwner,
  seenCount,
  onPrev,
  onNext,
  onClose,
  onPause,
  onOpenViewers,
  onDelete,
}: StoryViewerProps) {
  const current = stories[index]
  const touchStartX = useRef<number | null>(null)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${authorName}'s story`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current
        touchStartX.current = null
        if (start === null) return
        const end = e.changedTouches[0]?.clientX ?? start
        const delta = end - start
        if (Math.abs(delta) < 50) return
        if (delta < 0) onNext()
        else onPrev()
      }}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-black md:h-[80vh] md:max-w-sm md:rounded-xl">
        {imageUrl ? (
          <img src={imageUrl} alt={`${authorName}'s story`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
        )}

        <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-3">
          <StoryProgressBar count={stories.length} index={index} progress={progress} />
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={authorName} src={authorAvatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{authorName}</p>
              {current && <p className="text-xs text-white/80">{formatRelativeTime(current.createdAt)}</p>}
            </div>
            {isOwner && (
              <Button variant="ghost" size="sm" className="text-white" onClick={onOpenViewers}>
                Seen {seenCount}
              </Button>
            )}
            {isOwner && (
              <Button variant="ghost" size="icon-sm" aria-label="Delete story" className="text-white" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" aria-label="Close story" className="text-white" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <button
          type="button"
          className="absolute inset-y-24 left-0 z-10 w-1/3"
          aria-label="Previous story"
          onClick={onPrev}
          onMouseDown={() => onPause(true)}
          onMouseUp={() => onPause(false)}
          onMouseLeave={() => onPause(false)}
          onTouchStart={() => onPause(true)}
          onTouchEnd={() => onPause(false)}
        />
        <button
          type="button"
          className="absolute inset-y-24 right-0 z-10 w-2/3"
          aria-label="Next story"
          onClick={onNext}
          onMouseDown={() => onPause(true)}
          onMouseUp={() => onPause(false)}
          onMouseLeave={() => onPause(false)}
          onTouchStart={() => onPause(true)}
          onTouchEnd={() => onPause(false)}
        />

        {current?.caption && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-4">
            <StoryCaption caption={current.caption} />
          </div>
        )}
      </div>
    </div>
  )
}
