import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../shared/ui/dialog'
import { Avatar } from '../../shared/ui/avatar'
import type { Member } from '../../shared/types/database'

interface ViewerListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  viewers: Member[]
  isLoading?: boolean
}

export function ViewerListDialog({ open, onOpenChange, viewers, isLoading }: ViewerListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seen by {viewers.length}</DialogTitle>
        </DialogHeader>
        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <p className="p-2 text-sm text-muted-foreground">Loading…</p>
          ) : viewers.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">No views yet</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {viewers.map((viewer) => (
                <li key={viewer.id} className="flex items-center gap-3 rounded-lg p-2">
                  <Avatar name={viewer.display_name} src={viewer.avatar_url} size="sm" />
                  <span className="truncate text-sm">{viewer.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
