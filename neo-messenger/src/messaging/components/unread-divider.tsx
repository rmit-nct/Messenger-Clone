export function UnreadDivider() {
  return (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan to-transparent" />
      <span className="text-xs font-semibold uppercase tracking-widest text-cyan-strong dark:text-cyan">
        New messages
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan to-transparent" />
    </div>
  )
}
