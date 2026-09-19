// Stories feed — list of active authors (unseen first) + compose entry
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '@/auth'
import { Avatar } from '../../shared/ui/avatar'
import { Skeleton } from '../../shared/ui/skeleton'
import { EmptyState } from '../../shared/ui/empty-state'
import { ErrorState } from '../../shared/ui/error-state'
import { cn } from '../../shared/lib/utils'
import { formatRelativeTime } from '../../shared/lib/date'
import type { ActiveStoryAuthor } from '../../shared/types/database'
import { useActiveStories } from '../hooks/use-active-stories'

function StoryRow({ author }: { author: ActiveStoryAuthor }) {
  const latest = author.stories[author.stories.length - 1]
  const count = author.stories.length
  return (
    <li>
      <Link
        to={`/stories/${author.userId}`}
        className="flex items-center gap-3 rounded-lg border border-border bg-panel p-3 transition-colors hover:bg-muted"
      >
        <div
          className={cn(
            'rounded-full p-[2px]',
            author.hasUnseen ? 'bg-gradient-to-tr from-cyan to-gold' : 'bg-border',
          )}
        >
          <Avatar name={author.name} src={author.avatarUrl} size="md" className="border-2 border-panel" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{author.name}</p>
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? 'story' : 'stories'}
            {latest ? ` · ${formatRelativeTime(latest.createdAt)}` : ''}
          </p>
        </div>
        {author.hasUnseen && <span className="h-2.5 w-2.5 rounded-full bg-cyan" aria-label="Unseen" />}
      </Link>
    </li>
  )
}

export function StoriesPage() {
  const { authors, isLoading, isError, refetch } = useActiveStories()
  const { user } = useAuth()
  const navigate = useNavigate()
  const others = authors.filter((author) => author.userId !== user?.id)

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Stories</h1>
        <Link
          to="/story/create"
          className="inline-flex items-center gap-1 rounded-lg bg-cyan px-3 py-1.5 text-sm font-bold text-primary-foreground transition-transform hover:brightness-105 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Your story
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load stories" onRetry={() => void refetch()} />
      ) : others.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-7 w-7" />}
          title="No stories yet"
          description="Be the first to share a story with your community."
          actionLabel="Create story"
          onAction={() => navigate('/story/create')}
          className="py-16"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {others.map((author) => (
            <StoryRow key={author.userId} author={author} />
          ))}
        </ul>
      )}
    </div>
  )
}
