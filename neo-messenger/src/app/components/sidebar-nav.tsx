// SidebarNav — compact nav: Chats / Stories / Settings (no Calls/Archive/Support — not in SRS)
import { NavLink } from 'react-router-dom'
import { MessagesSquare, FileImage, Settings } from 'lucide-react'
import { cn } from '../../shared/lib/utils'

const items = [
  { to: '/inbox', label: 'Chats', icon: MessagesSquare },
  { to: '/stories', label: 'Stories', icon: FileImage },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isActive && 'bg-cyan/15 text-cyan-strong dark:text-cyan',
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}