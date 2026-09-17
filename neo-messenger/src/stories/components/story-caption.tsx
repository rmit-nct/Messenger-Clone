import { useState } from 'react'
import { cn } from '../../shared/lib/utils'

export function StoryCaption({ caption }: { caption: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!caption) return null
  const long = caption.length > 80
  return (
    <div className="max-w-prose">
      <p className={cn('text-sm text-white drop-shadow-md', long && !expanded && 'line-clamp-3')}>
        {caption}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-xs font-medium text-white/90 underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
