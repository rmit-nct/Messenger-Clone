// TopNavBar — mobile header: menu, logo, "+", avatar menu
import { Plus, SquarePen } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { UserMenu } from './user-menu'

export function TopNavBar({ onMenu }: { onMenu: () => void }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur-xl md:hidden">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="rounded-lg p-2 text-foreground hover:bg-muted"
      >
        <SquarePen className="h-6 w-6" />
      </button>
      <div className="flex items-center gap-2">
        <img src={logo} alt="NEO Messenger logo" className="h-8 w-8 rounded-full object-cover" />
        <span className="text-lg font-extrabold tracking-tighter text-foreground dark:text-cyan">NEO Messenger</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/new-conversation"
          aria-label="New conversation"
          className="rounded-full p-2 text-cyan-strong hover:bg-muted dark:text-cyan"
        >
          <Plus className="h-6 w-6" />
        </Link>
        <UserMenu />
      </div>
    </nav>
  )
}