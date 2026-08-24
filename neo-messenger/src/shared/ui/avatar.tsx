// Avatar — initials fallback, optional ring (unseen story / presence), alt text
import { cn } from '../lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

const sizeMap = {
  sm: 'h-8 w-8 text-xs', // 32
  md: 'h-10 w-10 text-sm', // 40
  lg: 'h-14 w-14 text-base', // 56
} as const

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

interface AvatarProps {
  name: string
  src?: string | null
  size?: AvatarSize
  className?: string
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={`Avatar of ${name}`}
        className={cn('shrink-0 rounded-full object-cover', sizeMap[size], className)}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={`Avatar of ${name}`}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-cyan/20 font-semibold text-cyan-strong dark:text-cyan',
        sizeMap[size],
        className,
      )}
    >
      {initialsOf(name)}
    </div>
  )
}