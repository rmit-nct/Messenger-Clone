// product intro + auth entry (guest only) — task 1.2, dev B

// TODO: implement

import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/button'

export function LandingPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold lg:text-6xl">NEO Messenger</h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-lg">
          Real-time messaging for your community. Private chats, small groups, and 24-hour photo
          stories.
        </p>
      </div>

      <ul className="text-muted-foreground grid gap-3 sm:grid-cols-3">
        <li>Instant messaging, no page reload required.</li>
        <li>Groups of up to 10 members</li>
        <li>Stories disappear after 24 hours.</li>
      </ul>

      <div className="flex gap-3">
        <Button render={<Link to="/signup" />} size="lg">
          <Link to="/signup">Start</Link>
        </Button>
        <Button render={<Link to="/login" />} variant="outline" size="lg">
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    </main>
  )
}
