import { ArrowDown } from 'lucide-react'
import { Button } from '../../shared/ui/button'

export function JumpToUnread({ count, onClick }: { count: number; onClick: () => void }) {
  if (count <= 0) return null
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full shadow-lg"
    >
      <ArrowDown className="mr-1 h-4 w-4" />
      {count} new
    </Button>
  )
}
