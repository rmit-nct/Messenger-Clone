import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { Button } from '../../shared/ui/button'
import { ImageUploader } from '../../shared/ui/image-uploader'
import { useAuth } from '@/auth'
import { uploadStoryImage } from '../../shared/lib/api/uploads'
import { activeStoriesKey, userStoriesKey } from '../../shared/lib/query-keys'
import { STORY_CAPTION_MAX } from '../../shared/constants/limits'
import { createStory } from '../api/stories'

export function StoryComposePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const userId = user?.id ?? ''

  async function publish() {
    if (!file || !userId) {
      setError('Pick an image first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      setProgress(0)
      const path = await uploadStoryImage(userId, file, setProgress)
      await createStory(userId, path, caption.trim() || null)
      await queryClient.invalidateQueries({ queryKey: activeStoriesKey })
      await queryClient.invalidateQueries({ queryKey: userStoriesKey(userId) })
      navigate('/inbox', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish story')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 md:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-none border-border bg-panel shadow-xl md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-xl md:border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-sm font-semibold text-foreground">Create Story</h1>
          <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => navigate('/inbox')}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <ImageUploader
            variant="square"
            disabled={busy}
            onSelect={setFile}
            onRemove={() => setFile(null)}
          />
          <div className="relative">
            <textarea
              value={caption}
              maxLength={STORY_CAPTION_MAX}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Write a caption..."
              aria-label="Story caption"
              className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {caption.length}/{STORY_CAPTION_MAX}
            </span>
          </div>
          {progress !== null && (
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-cyan transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="outline" onClick={() => navigate('/inbox')} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void publish()} disabled={busy || !file}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {busy ? 'Publishing...' : 'Share Story'}
          </Button>
        </div>
      </div>
    </div>
  )
}
