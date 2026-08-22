// SearchBar — full-width rounded, cyan focus ring, clear × (brief A5). Frame only; search wiring at 4.2
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value?: string
  onChange?: (v: string) => void
  autoFocus?: boolean
}

export function SearchBar({ value = '', onChange, autoFocus = false }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Search conversations..."
        aria-label="Search conversations"
        autoFocus={autoFocus}        className="w-full rounded-lg border border-border bg-panel py-2 pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan focus:ring-1 focus:ring-cyan outline-none"
      />
      {value && (
        <button
          onClick={() => onChange?.('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}