import { Button } from '../../shared/ui/button'
import { REACTION_EMOJIS } from '../../shared/constants/limits'

export function ReactionPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="flex gap-0.5 rounded-full border border-border bg-popover p-1 shadow-md">
      {REACTION_EMOJIS.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="icon-sm"
          aria-label={`React ${emoji}`}
          onClick={() => onPick(emoji)}
          className="text-base"
        >
          {emoji}
        </Button>
      ))}
    </div>
  )
}
