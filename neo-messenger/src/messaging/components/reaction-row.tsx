import { cn } from '../../shared/lib/utils'

interface ReactionRowProps {
  reactions: { user_id: string; emoji: string }[]
  currentUserId: string
  onToggle: (emoji: string) => void
}

export function ReactionRow({ reactions, currentUserId, onToggle }: ReactionRowProps) {
  if (reactions.length === 0) return null
  const counts = new Map<string, number>()
  for (const reaction of reactions) {
    counts.set(reaction.emoji, (counts.get(reaction.emoji) ?? 0) + 1)
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {[...counts.entries()].map(([emoji, count]) => {
        const mine = reactions.some((r) => r.emoji === emoji && r.user_id === currentUserId)
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(emoji)}
            aria-label={`${count} reaction ${emoji}${mine ? ', including you' : ''}`}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
              mine ? 'border-cyan bg-cyan/20' : 'border-border bg-panel',
            )}
          >
            <span>{emoji}</span>
            <span className="tabular-nums">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
