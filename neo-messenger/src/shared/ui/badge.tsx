// UnreadBadge — cyan pill, dark text, "99+" cap (brief A5)
import { cn } from '../lib/utils'

interface UnreadBadgeProps {
  count: number
  className?: string
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null
  const label = count > 99 ? '99+' : String(count)
  return (
    <span
      role="status"
      aria-label={`${count} unread`}
      className={cn('inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-cyan px-1.5 text-xs font-bold text-cyan-strong dark:text-[#003640]', className)}
    >
      {label}
    </span>
  )
}