// Root: providers + router
import { AppProviders } from './providers/app-providers'
import { AppRouter } from './router/app-router'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
