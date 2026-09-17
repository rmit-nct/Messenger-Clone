import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth'
import { Button } from '../../shared/ui/button'
import { ConfirmDialog } from '../../shared/ui/confirm-dialog'
import { ErrorState } from '../../shared/ui/error-state'
import { activeStoriesKey, userStoriesKey } from '../../shared/lib/query-keys'
import { deleteStory, fetchUserStories } from '../api/stories'
import { fetchStoryViewers, recordStoryView } from '../api/story-views'
import { useStoryImage } from '../hooks/use-story-image'
import { useStoryPlayback } from '../hooks/use-story-playback'
import { StoryViewer } from '../components/story-viewer'
import { ViewerListDialog } from '../components/viewer-list-dialog'

export function StoryViewerPage() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [viewersOpen, setViewersOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const storiesQuery = useQuery({
    queryKey: userStoriesKey(userId),
    queryFn: () => fetchUserStories(userId, user?.id ?? ''),
    enabled: !!userId,
  })
  const stories = storiesQuery.data?.stories ?? []
  const isOwner = !!user && user.id === userId

  const playback = useStoryPlayback(stories, {
    onSeen: (story) => {
      if (!user) return
      void recordStoryView(story.id, user.id)
        .then(() => queryClient.invalidateQueries({ queryKey: activeStoriesKey }))
        .catch(() => {})
    },
    onEnd: () => navigate('/inbox'),
  })
  const current = stories[playback.index]
  const imageUrl = useStoryImage(current?.imagePath)

  const viewersQuery = useQuery({
    queryKey: ['story-viewers', current?.id ?? ''],
    queryFn: () => fetchStoryViewers(current?.id ?? ''),
    enabled: isOwner && !!current,
  })

  useEffect(() => {
    if (storiesQuery.isSuccess && stories.length === 0) navigate('/inbox', { replace: true })
  }, [storiesQuery.isSuccess, stories.length, navigate])

  const { next, prev } = playback

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate('/inbox')
      if (event.key === 'ArrowLeft') prev()
      if (event.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, next, prev])

  async function handleDelete() {
    if (!current) return
    await deleteStory(current.id)
    await queryClient.invalidateQueries({ queryKey: userStoriesKey(userId) })
    await queryClient.invalidateQueries({ queryKey: activeStoriesKey })
    navigate('/inbox', { replace: true })
  }

  if (storiesQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-sm text-white">
        Loading...
      </div>
    )
  }

  if (storiesQuery.isError) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/90">
        <ErrorState title="Couldn't load story" onRetry={() => void storiesQuery.refetch()} />
        <Button variant="outline" onClick={() => navigate('/inbox')}>
          Close
        </Button>
      </div>
    )
  }

  const author = storiesQuery.data

  return (
    <>
      <StoryViewer
        authorName={author?.name ?? 'Story'}
        authorAvatarUrl={author?.avatarUrl ?? null}
        stories={stories}
        index={playback.index}
        progress={playback.progress}
        imageUrl={imageUrl}
        isOwner={isOwner}
        seenCount={viewersQuery.data?.length ?? 0}
        onPrev={playback.prev}
        onNext={playback.next}
        onClose={() => navigate('/inbox')}
        onPause={playback.setPaused}
        onOpenViewers={() => setViewersOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />
      <ViewerListDialog
        open={viewersOpen}
        onOpenChange={setViewersOpen}
        viewers={viewersQuery.data ?? []}
        isLoading={viewersQuery.isLoading}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this story?"
        description="It will be removed for everyone."
        confirmLabel="Delete"
        onConfirm={() => void handleDelete()}
      />
    </>
  )
}
