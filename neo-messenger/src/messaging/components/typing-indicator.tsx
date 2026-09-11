import { Avatar } from '../../shared/ui/avatar'
import type { Member } from '../../shared/types/database'

export function TypingIndicator({ users }: { users: Member[] }) {
  if (users.length === 0) return null
  const label =
    users.length === 1
      ? `${users[0].display_name} is typing…`
      : `${users[0].display_name} and ${users[1].display_name} are typing…`

  return (
    <div className="flex items-center gap-2 px-1 py-2" role="status" aria-live="polite">
      {users[0] && <Avatar name={users[0].display_name} src={users[0].avatar_url} size="sm" />}
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:400ms]" />
      </span>
    </div>
  )
}
