export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
