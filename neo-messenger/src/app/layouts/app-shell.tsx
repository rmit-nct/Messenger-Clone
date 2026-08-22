// AppShell — responsive shell: desktop sidebar + main pane; mobile single pane + top/bottom nav + drawer
// Slot contract: <AppShell sidebar main> — sidebar slot filled by feature barrels, main by page content
import { useState, type ReactNode } from 'react'
import { X, Menu } from 'lucide-react'
import { TopNavBar } from '../components/top-nav-bar'
import { BottomNavBar } from '../components/bottom-nav-bar'
import { UserMenu } from '../components/user-menu'

interface AppShellProps {
  sidebar: ReactNode
  main: ReactNode
}

export function AppShell({ sidebar, main }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-foreground">
      {/* Mobile top bar */}
      <TopNavBar onMenu={() => setDrawerOpen(true)} />

      {/* Mobile drawer */}
      <div
        className={drawerOpen ? 'fixed inset-0 z-50 md:hidden' : 'hidden'}
        onClick={() => setDrawerOpen(false)}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-panel p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-extrabold tracking-tighter text-cyan">NEO Messenger</span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {sidebar}
        </div>
      </div>

      {/* Desktop/tablet sidebar */}
      <aside
        className={`hidden h-full flex-col border-r border-border bg-panel md:flex transition-all ${
          sidebarCollapsed ? 'md:w-16' : 'md:w-80 lg:w-96'
        }`}
      >
        {/* nav (compact) + hamburger */}
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="hidden text-lg font-extrabold tracking-tighter text-cyan md:block lg:block">
            NEO Messenger
          </span>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{sidebar}</div>
        <div className="border-t border-border p-2">
          <UserMenu />
        </div>
      </aside>

      {/* Main pane */}
      <main className="flex-1 min-w-0 overflow-y-auto md:ml-0 pt-16 md:pt-0">{main}</main>

      {/* Mobile bottom nav */}
      <BottomNavBar />
    </div>
  )
}