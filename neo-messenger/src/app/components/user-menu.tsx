// UserMenu — avatar dropdown: Profile / Settings / Sign out (login stub; auth in 1.1)
// Avatar left, theme toggle right. Dropdown anchors to the avatar (inner relative),
// opening downward unless bottom-of-viewport forces upward; rightSide flips outward in top-nav.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, User, Sun, Moon } from 'lucide-react'
import { Avatar } from '../../shared/ui/avatar'
import { Button } from '../../shared/ui/button'
import { cn } from '../../shared/lib/utils'
import { useTheme } from '../contexts/theme'

// TODO 1.1: real session from auth context; 1.4: real avatar/name
const ME = { name: 'Guest', avatarUrl: null }

// approximate menu size for placement checks
const MENU_HEIGHT = 272
const MENU_WIDTH = 192

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [below, setBelow] = useState(true)
  const [rightSide, setRightSide] = useState(false)
  const [buttonEl, setButtonEl] = useState<HTMLButtonElement | null>(null)
  const { resolved, setTheme } = useTheme()

  const toggle = (el: HTMLButtonElement) => {
    const next = !open
    setOpen(next)
    if (next) {
      const rect = el.getBoundingClientRect()
      setBelow(rect.bottom + MENU_HEIGHT <= window.innerHeight)
      setRightSide(rect.right + MENU_WIDTH <= window.innerWidth)
    }
  }

  return (
    <div className={cn('flex items-center justify-between gap-1', className)}>
      {/* avatar + anchored dropdown */}
      <div className="relative inline-block">
        <Button
          ref={setButtonEl}
          variant="ghost"
          size="icon"
          aria-label="Open account menu"
          aria-expanded={open}
          onClick={() => buttonEl && toggle(buttonEl)}
        >
          <Avatar name={ME.name} src={ME.avatarUrl} size="sm" />
        </Button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div
              className={cn(
                'absolute z-20 w-48 rounded-lg border border-border bg-panel p-1 shadow-lg',
                below ? 'top-full mt-1' : 'bottom-full mb-1',
                rightSide ? 'left-full ml-1' : 'right-0',
              )}
            >
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

      {/* theme toggle — right side */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        title={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
      >
        {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  )
}