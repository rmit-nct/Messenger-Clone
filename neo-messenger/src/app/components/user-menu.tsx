// UserMenu — avatar dropdown: Profile / Settings / Sign out (login stub; auth in 1.1)
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { Avatar } from '../../shared/ui/avatar'
import { Button } from '../../shared/ui/button'

// TODO 1.1: real session from auth context; 1.4: real avatar/name
const ME = { name: 'Guest', avatarUrl: null }

export function UserMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Avatar name={ME.name} src={ME.avatarUrl} size="sm" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 z-20 mb-2 w-48 rounded-lg border border-border bg-panel p-1 shadow-lg">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground">{ME.name}</p>
              <p className="text-xs text-muted-foreground">guest (auth not wired)</p>
            </div>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}