// BottomNavBar — mobile: Chats / Stories / Profile / Settings (brief B7, no Calls)
import { NavLink } from 'react-router-dom'
import { MessagesSquare, FileImage, User, Settings } from 'lucide-react'
import { cn } from '../../shared/lib/utils'

const items = [
  { to: '/inbox', label: 'Chats', icon: MessagesSquare },
  { to: '/stories', label: 'Stories', icon: FileImage },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-center justify-around border-t border-border bg-panel/95 pb-safe backdrop-blur-lg md:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground',
              isActive && 'text-cyan-strong dark:text-cyan',
            )
          }
        >
          <Icon className="h-6 w-6" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}