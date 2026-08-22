// Root: query provider + theme + router. Placeholder pages until feature tasks land
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/theme-context'
import { AppShell } from './layouts/app-shell'
import { PaneEmptyState } from './components/pane-empty-state'
import { InboxListRegion } from '../inbox'

// TODO 1.1: AuthProvider + guards; route guest pages (/login, /signup) here
// TODO 1.6: wire real NewConversationDialog trigger; 2.1: /conversation/:id route + conversation pane
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/inbox" replace />} />
            <Route
              path="/inbox"
              element={<AppShell sidebar={<InboxListRegion />} main={<PaneEmptyState />} />}
            />
            <Route path="*" element={<Navigate to="/inbox" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}