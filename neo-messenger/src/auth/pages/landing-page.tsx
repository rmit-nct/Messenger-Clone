// product intro + auth entry (guest only)
import { Link } from 'react-router-dom'
import { Bell, MessageCircle, MoreHorizontal, PlayCircle, Search, Send, Video } from 'lucide-react'
import { Avatar } from '@/shared/ui/avatar'

const proofNames = ['Sarah Jenkins', 'Alex Mercer', 'Jordan Lee']

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-bg text-foreground">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[40vw] w-[40vw] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[30vw] w-[30vw] rounded-full bg-secondary/20 blur-3xl" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-panel/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-cyan-strong dark:text-cyan" />
            <span className="text-xl font-extrabold tracking-tighter">NEO</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#product" className="text-sm font-bold text-cyan-strong dark:text-cyan">
              Product
            </a>
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#community" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Community
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-semibold transition-colors hover:text-cyan-strong dark:hover:text-cyan md:block"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-cyan px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:brightness-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main
        id="product"
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 pb-24 pt-32 lg:flex-row lg:gap-10 lg:px-8"
      >
        <section className="flex w-full flex-col items-center gap-6 text-center lg:w-1/2 lg:items-start lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            <span className="text-xs font-medium text-muted-foreground">NEO Messenger is live</span>
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Communicate with{' '}
            <span className="bg-gradient-to-br from-cyan-strong to-gold-strong bg-clip-text text-transparent">
              Luminous Clarity
            </span>
          </h1>

          <p className="max-w-lg text-base text-muted-foreground">
            The modern messenger for high-density collaboration. Crystal-clear chats, fluid group
            dynamics, and 24-hour photo stories in a workspace built for your community.
          </p>

          <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link
              to="/signup"
              className="w-full rounded-lg bg-cyan px-6 py-3 text-center text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:brightness-105 active:scale-95 sm:w-auto"
            >
              Start for free
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-lg font-semibold transition-colors hover:bg-panel sm:w-auto"
            >
              <PlayCircle className="h-5 w-5 text-cyan-strong dark:text-cyan" />
              Log in
            </Link>
          </div>

          <div id="community" className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              {proofNames.map((name) => (
                <span key={name} className="rounded-full border-2 border-bg">
                  <Avatar name={name} size="sm" />
                </span>
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground">Join your community</span>
          </div>
        </section>

        <section
          className="relative hidden h-[500px] w-full md:block lg:w-1/2"
          style={{ perspective: '1000px' }}
        >
          <div
            className="absolute right-0 top-10 flex h-[360px] w-[400px] flex-col overflow-hidden rounded-xl border border-border bg-panel/70 shadow-2xl backdrop-blur-xl"
            style={{ transform: 'rotateY(-12deg) rotateX(6deg)' }}
          >
            <div className="flex h-12 items-center gap-2 border-b border-border/60 bg-panel/50 px-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30">
                <Bell className="h-4 w-4 text-gold-strong" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold">Design Team Alpha</p>
                <p className="text-[10px] text-muted-foreground">4 online</p>
              </div>
              <div className="ml-auto flex gap-2 text-muted-foreground">
                <Search className="h-4 w-4" />
                <MoreHorizontal className="h-4 w-4" />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 bg-bg/40 p-3">
              <div className="flex max-w-[80%] items-end gap-2">
                <Avatar name="Alex Mercer" size="sm" />
                <div className="rounded-lg rounded-bl-none border border-border/60 bg-panel p-2 shadow-sm">
                  <p className="text-xs">The new mockups are ready for review! 🚀</p>
                </div>
              </div>
              <div className="flex max-w-[80%] items-end gap-2 self-end">
                <div className="rounded-lg rounded-br-none border border-primary/30 bg-primary/30 p-2 shadow-sm">
                  <p className="text-xs font-medium text-cyan-strong dark:text-cyan">
                    Looking great. Let&apos;s hop on a quick call to finalize.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex h-14 items-center gap-2 border-t border-border/60 bg-panel/50 px-3">
              <span className="flex h-8 flex-1 items-center rounded-full border border-border bg-bg px-3 text-xs text-muted-foreground">
                Type a message...
              </span>
              <Send className="h-5 w-5 text-cyan-strong dark:text-cyan" />
            </div>
          </div>

          <div
            className="absolute left-0 top-24 flex w-48 items-center gap-2 rounded-lg border border-border bg-panel/80 p-3 shadow-lg backdrop-blur-xl"
            style={{ transform: 'rotate(-6deg)' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/40">
              <Video className="h-5 w-5 text-cyan-strong dark:text-cyan" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">Incoming Call</p>
              <p className="text-xs font-medium text-cyan-strong dark:text-cyan">Sarah Jenkins</p>
            </div>
          </div>

          <div
            className="absolute bottom-8 left-10 flex w-56 flex-col gap-2 rounded-lg border border-border bg-panel/80 p-3 shadow-lg backdrop-blur-xl"
            style={{ transform: 'rotate(3deg)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Daily Standup</span>
              <Bell className="h-4 w-4 text-gold-strong" />
            </div>
            <div className="flex -space-x-2">
              {proofNames.map((name) => (
                <span key={name} className="rounded-full border-2 border-panel">
                  <Avatar name={name} size="sm" />
                </span>
              ))}
            </div>
            <div className="mt-1 h-1 w-full rounded-full bg-muted">
              <div className="h-1 w-2/3 rounded-full bg-gold" />
            </div>
          </div>
        </section>

        <section id="features" className="sr-only">
          Real-time messaging, small groups up to 10 members, and 24-hour photo stories.
        </section>
      </main>
    </div>
  )
}
