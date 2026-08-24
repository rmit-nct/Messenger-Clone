// PaneEmptyState — "Select a conversation" glass card (mockup main pane) + New Message CTA
import { MessagesSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../../shared/ui/empty-state'

export function PaneEmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <EmptyState
        icon={<MessagesSquare className="h-8 w-8" />}
        title="Select a conversation"
        description="Choose a chat from the sidebar or start a new message to begin communicating."
        actionLabel="New Message"
        onAction={() => navigate('/inbox')}
      />
    </div>
  )
}