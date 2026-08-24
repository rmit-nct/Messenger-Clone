// AppShell — responsive shell: desktop sidebar + main pane; mobile single pane + top/bottom nav + drawer
// Slot contract: <AppShell sidebar main> — sidebar is a function of collapsed state so feature content
// can adapt to icon-rail mode. sidebar slot filled by feature barrels, main by page content.
import { useState, type ReactNode } from 'react'
import { X, Menu } from 'lucide-react'
import logo from '../../assets/logo.png'
import { TopNavBar } from '../components/top-nav-bar'
import { BottomNavBar } from '../components/bottom-nav-bar'
import { UserMenu } from '../components/user-menu'

interface AppShellProps {
  sidebar: (collapsed: boolean, onExpand: () => void) => ReactNode
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
          {sidebar(false, () => setSidebarCollapsed(true))}
        </div>
      </div>

      {/* Desktop/tablet sidebar */}
      <aside
        className={`relative hidden h-full flex-col border-r border-border bg-panel md:flex transition-all ${
          sidebarCollapsed ? 'md:w-20' : 'md:w-80 lg:w-96'
        }`}
      >
        {/* brand — collapsed: logo only, centered, fixed size (no squish) */}
        <div className="shrink-0 overflow-hidden border-b border-border">
          <div className="m-1.5 flex items-center justify-between rounded-lg bg-foreground/10 px-2 py-2">
            {sidebarCollapsed ? (
              <img
                src={logo}
                alt="NEO Messenger"
                className="mx-auto h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
            <div className="flex min-w-0 items-center gap-2">
              <img
                src={logo}
                alt="NEO Messenger logo"
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <span className="truncate text-lg font-extrabold tracking-tighter text-foreground dark:text-cyan">
                NEO Messenger
              </span>
            </div>
          )}
        </div>
        </div>

        {/* feature content — adapts to collapsed (icon rail) */}
        <div className="flex-1 overflow-y-auto">{sidebar(sidebarCollapsed, () => setSidebarCollapsed(false))}</div>

        <div className="shrink-0 border-t border-border p-2">
          <UserMenu className="w-full" />
        </div>

        {/* floating collapse bubble — just right of the sidebar edge */}
        <button
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-muted-foreground shadow-md transition-colors hover:bg-foreground/20 hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </button>
      </aside>

      {/* Main pane */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-16 md:pt-0">{main}</main>

      {/* Mobile bottom nav */}
      <BottomNavBar />
    </div>
  )
}