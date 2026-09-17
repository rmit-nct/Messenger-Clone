import { cn } from '../../shared/lib/utils'

interface StoryProgressBarProps {
  count: number
  index: number
  progress: number
}

export function StoryProgressBar({ count, index, progress }: StoryProgressBarProps) {
  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-label={`Story ${index + 1} of ${count}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
          <div
            className={cn('h-full bg-white', i < index && 'w-full', i > index && 'w-0')}
            style={i === index ? { width: `${progress}%` } : undefined}
          />
        </div>
      ))}
    </div>
  )
}
