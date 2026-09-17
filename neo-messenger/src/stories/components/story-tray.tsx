// StoryTray — horizontal scroll of StoryAvatars; active ring (cyan→gold), viewed (muted), own "+"
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { StoryAvatar, type StoryRingState } from './story-avatar'

export interface TrayStory {
  userId: string
  name: string
  imageUrl?: string | null
  ring: StoryRingState
}

interface StoryTrayProps {
  stories: TrayStory[]
}

export function StoryTray({ stories }: StoryTrayProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      <div className="flex shrink-0 flex-col items-center gap-1">
        <Link
          to="/story/create"
          aria-label="Add story"
          className="rounded-full bg-gradient-to-tr from-cyan to-gold p-[2px]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/40">
            <Plus className="h-5 w-5 text-gold" />
          </span>
        </Link>
        <span className="w-14 truncate text-center text-xs text-muted-foreground">Your story</span>
      </div>
      {stories.map((s) => (
        <Link
          key={s.userId}
          to={`/stories/${s.userId}`}
          className="flex shrink-0 flex-col items-center gap-1"
        >
          <StoryAvatar name={s.name} src={s.imageUrl} ring={s.ring} />
          <span className="w-14 truncate text-center text-xs text-muted-foreground">{s.name}</span>
        </Link>
      ))}
    </div>
  )
}

export function StoryTraySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-busy="true" aria-label="Loading stories">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-14 shrink-0">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-muted" />
          <div className="mt-1 h-2 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
