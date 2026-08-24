// StoryAvatar — 56-64px avatar with ring state: active cyan→gold, viewed muted, own "+" (brief A5/B7)
import { Avatar } from '../../shared/ui/avatar'

export type StoryRingState = 'active' | 'viewed'

interface StoryAvatarProps {
  name: string
  src?: string | null
  ring: StoryRingState
}

const ringClass = {
  active:
    'p-[2px] ring-1 ring-transparent bg-gradient-to-r from-cyan to-gold',
  viewed: 'p-[2px] ring-2 ring-border bg-muted',
} as const

export function StoryAvatar({ name, src, ring }: StoryAvatarProps) {
  return (
    <div className={ringClass[ring]}>
      <Avatar name={name} src={src} size="lg" className="ring-2 ring-border" />
    </div>
  )
}