import { Outlet } from 'react-router-dom'
import { AppShell } from './app-shell'
import { InboxListRegion, useInboxRealtime } from '../../inbox'
import { PresenceProvider } from '../../messaging'

export function ShellLayout() {
  useInboxRealtime()
  return (
    <PresenceProvider>
      <AppShell
        sidebar={(collapsed, onExpand) => (
          <InboxListRegion collapsed={collapsed} onExpand={onExpand} />
        )}
        main={<Outlet />}
      />
    </PresenceProvider>
  )
}
