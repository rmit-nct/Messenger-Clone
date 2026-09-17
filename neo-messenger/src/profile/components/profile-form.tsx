import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../../shared/ui/button'
import { Input } from '../../shared/ui/input'
import { FormField } from '../../shared/ui/forms/form-field'
import { ImageUploader } from '../../shared/ui/image-uploader'
import { uploadAvatar } from '../../shared/lib/api/uploads'
import { useAuth } from '@/auth'
import type { Profile } from '../../shared/types/database'
import { useUpdateProfile } from '../hooks/use-profile'

interface ProfileFormProps {
  initialProfile: Profile | null
  submitLabel: string
  onSaved?: (profile: Profile) => void
}

export function ProfileForm({ initialProfile, submitLabel, onSaved }: ProfileFormProps) {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const updateProfile = useUpdateProfile(userId)

  const [name, setName] = useState(initialProfile?.display_name ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const trimmed = name.trim()
  const nameInvalid = trimmed.length < 2 || trimmed.length > 40

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    if (trimmed.length < 2 || trimmed.length > 40) {
      setError('Display name must be 2–40 characters.')
      return
    }
    if (!userId) return
    setError(null)
    try {
      let avatar_url: string | undefined
      if (file) {
        setProgress(0)
        avatar_url = await uploadAvatar(userId, file, setProgress)
      }
      const profile = await updateProfile.mutateAsync({
        display_name: trimmed,
        ...(avatar_url ? { avatar_url } : {}),
      })
      setFile(null)
      setSaved(true)
      onSaved?.(profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setProgress(null)
    }
  }

  const busy = updateProfile.isPending || progress !== null

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField
        id="profile-name"
        label="Display name"
        error={nameInvalid ? 'Must be 2–40 characters' : undefined}
      >
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={nameInvalid}
        />
      </FormField>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Avatar</span>
        <ImageUploader
          initialUrl={initialProfile?.avatar_url ?? null}
          disabled={busy}
          onSelect={setFile}
          onRemove={() => setFile(null)}
        />
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
      {saved && (
        <p role="status" className="text-sm text-cyan-strong dark:text-cyan">
          Profile saved.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
