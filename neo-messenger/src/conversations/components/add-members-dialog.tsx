import { useEffect, useState } from 'react'
import { Check, Loader2, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog'
import { Button } from '../../shared/ui/button'
import { Input } from '../../shared/ui/input'
import { Avatar } from '../../shared/ui/avatar'
import { cn } from '../../shared/lib/utils'
import { useDebounce } from '../../shared/hooks/use-debounce'
import { searchUsers } from '../../shared/lib/api/users'
import { useAuth } from '@/auth'
import type { Member } from '../../shared/types/database'

interface AddMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludeIds: string[]
  maxSelectable: number
  onAdd: (userIds: string[]) => Promise<void>
}

export function AddMembersDialog({
  open,
  onOpenChange,
  excludeIds,
  maxSelectable,
  onAdd,
}: AddMembersDialogProps) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Member[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounced = useDebounce(query, 300)

  const excludeIdsKey = excludeIds.join(',')
  const key = `${user?.id ?? ''}:${excludeIdsKey}:${debounced}`
  const [loaded, setLoaded] = useState<{ key: string; results: Member[] } | null>(null)

  useEffect(() => {
    if (!open) return
    let active = true
    searchUsers(debounced, user?.id ?? '')
      .then((users) => {
        if (active) setLoaded({ key, results: users })
      })
      .catch(() => {
        if (active) setLoaded({ key, results: [] })
      })
    return () => {
      active = false
    }
  }, [open, debounced, key, user?.id])

  const excluded = new Set(excludeIds)
  if (user) excluded.add(user.id)
  const raw = loaded?.key === key ? loaded.results : []
  const results = raw.filter((member) => !excluded.has(member.id))
  const isLoading = loaded?.key !== key

  function reset() {
    setQuery('')
    setSelected([])
    setError(null)
  }

  function toggle(member: Member) {
    setSelected((prev) =>
      prev.some((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : prev.length >= maxSelectable
          ? prev
          : [...prev, member],
    )
  }

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      await onAdd(selected.map((m) => m.id))
      onOpenChange(false)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add members')
    } finally {
      setBusy(false)
    }
  }

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
          <DialogTitle>Add members</DialogTitle>
        </DialogHeader>

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

        <p className="text-xs text-muted-foreground">
          {selected.length}/{Math.max(maxSelectable, 0)} selected
        </p>

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
                onClick={() => toggle(member)}
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

        <Button onClick={() => void submit()} disabled={selected.length === 0 || busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add
        </Button>
      </DialogContent>
    </Dialog>
  )
}
