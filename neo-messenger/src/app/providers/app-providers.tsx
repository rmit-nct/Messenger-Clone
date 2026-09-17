import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../auth'
import { ThemeProvider } from '../contexts/theme-context'
import { TextSizeProvider } from '../contexts/text-size-context'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TextSizeProvider>{children}</TextSizeProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
