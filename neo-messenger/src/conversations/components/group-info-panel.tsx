import { useRef, useState } from 'react'
import { Camera, Crown, Loader2, Shield, UserMinus, UserPlus, X } from 'lucide-react'
import { Avatar } from '../../shared/ui/avatar'
import { Button } from '../../shared/ui/button'
import { Input } from '../../shared/ui/input'
import { ConfirmDialog } from '../../shared/ui/confirm-dialog'
import { ImageLightbox } from '../../shared/ui/image-lightbox'
import { useSignedUrl } from '../../messaging'
import { uploadMessageImage, validateImage } from '../../shared/lib/api/uploads'
import { GROUP_MAX } from '../../shared/constants/limits'
import type { Conversation, ConversationMember } from '../../shared/types/database'
import { useConversationInfo } from '../hooks/use-conversation-info'
import { AddMembersDialog } from './add-members-dialog'

interface ConversationInfoPanelProps {
  conversation: Conversation
  members: ConversationMember[]
  currentUserId: string
  onClose: () => void
}

function MediaThumb({
  path,
  onOpen,
}: {
  path: string
  onOpen: (url: string) => void
}) {
  const url = useSignedUrl(path)
  if (!url) {
    return <div className="aspect-square animate-pulse rounded-lg bg-muted" aria-hidden="true" />
  }
  return (
    <button type="button" onClick={() => onOpen(url)} className="overflow-hidden rounded-lg">
      <img
        src={url}
        alt="Conversation media"
        className="aspect-square w-full object-cover transition-transform hover:scale-105"
      />
    </button>
  )
}

export function ConversationInfoPanel({
  conversation,
  members,
  currentUserId,
  onClose,
}: ConversationInfoPanelProps) {
  const info = useConversationInfo(conversation.id)
  const groupImage = useSignedUrl(conversation.image_url)
  const [addOpen, setAddOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(conversation.title ?? '')
  const [kickTarget, setKickTarget] = useState<ConversationMember | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isGroup = conversation.type === 'group'
  const isCreator = conversation.created_by === currentUserId
  const me = members.find((m) => m.id === currentUserId)
  const isAdmin = isCreator || !!me?.is_admin
  const other = members.find((m) => m.id !== currentUserId)
  const name = isGroup ? (conversation.title ?? 'Group') : (other?.display_name ?? 'Direct message')
  const avatarSrc = isGroup ? groupImage : (other?.avatar_url ?? null)
  const remaining = GROUP_MAX - members.length

  async function changePhoto(file: File | null) {
    if (!file) return
    const valid = validateImage(file)
    if (!valid.ok) {
      setError(valid.error ?? 'Invalid image')
      return
    }
    setError(null)
    setUploadPct(0)
    try {
      const path = await uploadMessageImage(conversation.id, file, setUploadPct)
      await info.updateInfo({ imagePath: path })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadPct(null)
    }
  }

  async function saveTitle() {
    const value = titleDraft.trim()
    setEditingTitle(false)
    if (!value || value === (conversation.title ?? '')) return
    setError(null)
    try {
      await info.updateInfo({ title: value })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename group')
    }
  }

  async function confirmKick() {
    if (!kickTarget) return
    setError(null)
    try {
      await info.removeMember(kickTarget.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove member')
    } finally {
      setKickTarget(null)
    }
  }

  async function toggleAdmin(member: ConversationMember) {
    setError(null)
    try {
      await info.setAdmin(member.id, !member.is_admin)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update admin')
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-panel px-4">
        <h2 className="text-sm font-semibold text-foreground">Conversation info</h2>
        <Button variant="ghost" size="icon-sm" aria-label="Close info" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
        <div className="relative">
          <Avatar name={name} src={avatarSrc} size="lg" />
          {isGroup && isAdmin && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Change group photo"
              className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground"
            >
              {uploadPct === null ? (
                <Camera className="h-3.5 w-3.5" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
            </button>
          )}
        </div>

        {isGroup && isAdmin ? (
          editingTitle ? (
            <Input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => void saveTitle()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveTitle()
              }}
              className="max-w-[12rem] text-center"
              aria-label="Group name"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleDraft(conversation.title ?? '')
                setEditingTitle(true)
              }}
              className="text-base font-semibold text-foreground hover:underline"
            >
              {name}
            </button>
          )
        ) : (
          <p className="text-base font-semibold text-foreground">{name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {isGroup ? `${members.length} member${members.length === 1 ? '' : 's'}` : 'Direct message'}
        </p>
      </div>

      {error && (
        <p role="alert" className="px-4 pb-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <section className="border-t border-border px-4 py-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Media
        </h3>
        {info.isLoadingMedia ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : info.mediaError ? (
          <div className="text-xs text-muted-foreground">
            Couldn&apos;t load media.{' '}
            <button type="button" className="underline" onClick={() => void info.refetchMedia()}>
              Retry
            </button>
          </div>
        ) : info.media.length === 0 ? (
          <p className="text-xs text-muted-foreground">No media yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {info.media.map((item) => (
              <MediaThumb key={item.id} path={item.storage_path} onOpen={setLightboxUrl} />
            ))}
          </div>
        )}
      </section>

      {isGroup && (
        <section className="border-t border-border px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Members
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAddOpen(true)}
              disabled={remaining <= 0 || info.isMutating}
            >
              <UserPlus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <ul className="flex flex-col gap-1">
            {members.map((member) => {
              const creator = member.id === conversation.created_by
              const canKick =
                isAdmin &&
                member.id !== currentUserId &&
                !creator &&
                (isCreator || !member.is_admin)
              const canMakeAdmin = isAdmin && member.id !== currentUserId && !member.is_admin
              const canRemoveAdmin = isCreator && member.id !== currentUserId && member.is_admin
              return (
                <li key={member.id} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
                  <Avatar name={member.display_name} src={member.avatar_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {member.display_name}
                      {member.id === currentUserId && (
                        <span className="text-muted-foreground"> (you)</span>
                      )}
                    </p>
                    {creator ? (
                      <span className="inline-flex items-center gap-1 text-xs text-secondary">
                        <Crown className="h-3 w-3" /> Creator
                      </span>
                    ) : member.is_admin ? (
                      <span className="inline-flex items-center gap-1 text-xs text-cyan-strong dark:text-cyan">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : null}
                  </div>
                  {canMakeAdmin && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Make ${member.display_name} admin`}
                      title="Make admin"
                      onClick={() => void toggleAdmin(member)}
                      disabled={info.isMutating}
                    >
                      <Shield className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {canRemoveAdmin && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${member.display_name} as admin`}
                      title="Remove admin"
                      onClick={() => void toggleAdmin(member)}
                      disabled={info.isMutating}
                    >
                      <Shield className="h-3.5 w-3.5 text-cyan-strong dark:text-cyan" />
                    </Button>
                  )}
                  {canKick && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${member.display_name}`}
                      title="Remove from group"
                      onClick={() => setKickTarget(member)}
                      disabled={info.isMutating}
                    >
                      <UserMinus className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void changePhoto(e.target.files?.[0] ?? null)}
      />

      {isGroup && (
        <AddMembersDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          excludeIds={members.map((m) => m.id)}
          maxSelectable={Math.max(remaining, 0)}
          onAdd={async (ids) => {
            await info.addMembers(ids)
          }}
        />
      )}

      <ConfirmDialog
        open={!!kickTarget}
        onOpenChange={(next) => {
          if (!next) setKickTarget(null)
        }}
        title={`Remove ${kickTarget?.display_name ?? 'member'}?`}
        description="They will lose access to this conversation."
        confirmLabel="Remove"
        onConfirm={() => void confirmKick()}
      />

      <ImageLightbox
        open={!!lightboxUrl}
        onOpenChange={(next) => {
          if (!next) setLightboxUrl(null)
        }}
        src={lightboxUrl}
        alt="Conversation media"
      />
    </div>
  )
}
