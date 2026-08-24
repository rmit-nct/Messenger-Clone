// EmptyState — icon in panel circle, title, helper, optional CTA (brief A5)
import { cn } from '../lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-panel text-cyan-strong shadow-inner ring-1 ring-border dark:text-cyan">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button size="lg" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}