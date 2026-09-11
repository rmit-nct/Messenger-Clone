import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog'
import { Button } from '../../shared/ui/button'
import { Input } from '../../shared/ui/input'
import { Avatar } from '../../shared/ui/avatar'
import { cn } from '../../shared/lib/utils'
import { GROUP_MAX } from '../../shared/constants/limits'
import { useAuth } from '@/auth'
import { useDebouncedSearch } from '../hooks/use-debounced-search'
import { createDirectConversation, createGroupConversation } from '../api/new-conversation'
import { useQueryClient } from '@tanstack/react-query'
import { inboxKey } from '../../shared/lib/query-keys'
import type { Member } from '../../shared/types/database'

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewConversationDialog({ open, onOpenChange }: NewConversationDialogProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'direct' | 'group'>('direct')
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [selected, setSelected] = useState<Member[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { results, isLoading } = useDebouncedSearch(query, user?.id ?? '')

  function reset() {
    setQuery('')
    setTitle('')
    setSelected([])
    setError(null)
  }

  function toggle(member: Member) {
    setSelected((prev) =>
      prev.some((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : prev.length >= GROUP_MAX - 1
          ? prev
          : [...prev, member],
    )
  }

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      const id =
        tab === 'direct'
          ? await createDirectConversation(selected[0].id)
          : await createGroupConversation({ title, memberIds: selected.map((m) => m.id) })
      await queryClient.invalidateQueries({ queryKey: inboxKey })
      onOpenChange(false)
      reset()
      navigate(`/conversation/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create conversation')
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = tab === 'direct' ? selected.length === 1 : selected.length >= 1

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          {(['direct', 'group'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={tab === value ? 'default' : 'outline'}
              onClick={() => {
                setTab(value)
                setSelected([])
              }}
            >
              {value === 'direct' ? 'Direct' : 'Group'}
            </Button>
          ))}
        </div>

        {tab === 'group' && (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Group name (optional)"
            aria-label="Group name"
          />
        )}

        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="pl-8"
            aria-label="Search people"
          />
        </div>

        {tab === 'group' && (
          <p className="text-xs text-muted-foreground">
            {selected.length + 1}/{GROUP_MAX} selected (including you)
          </p>
        )}

        <div className="max-h-64 overflow-y-auto">
          {isLoading && <p className="p-2 text-sm text-muted-foreground">Searching...</p>}
          {!isLoading && results.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">No users found</p>
          )}
          {results.map((member) => {
            const isSelected = selected.some((m) => m.id === member.id)
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => (tab === 'direct' ? setSelected([member]) : toggle(member))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted',
                  isSelected && 'bg-cyan/10',
                )}
              >
                <Avatar name={member.display_name} src={member.avatar_url} size="sm" />
                <span className="flex-1 truncate text-sm">{member.display_name}</span>
                {isSelected && <Check className="h-4 w-4 text-cyan-strong dark:text-cyan" />}
              </button>
            )
          })}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button onClick={submit} disabled={!canSubmit || busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create
        </Button>
      </DialogContent>
    </Dialog>
  )
}
