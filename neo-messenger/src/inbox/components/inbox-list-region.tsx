// InboxListRegion — sidebar slot: new-conversation + search + story tray + conversation list.
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '../../shared/ui/button'
import { SearchBar } from './search-bar'
import { ConversationList } from './conversation-list'
import { NewConversationDialog } from './new-conversation-dialog'
import { StoryTray, StoryTraySkeleton } from '../../stories'
import type { TrayStory } from '../../stories'

interface InboxListRegionProps {
  collapsed?: boolean
  onExpand?: () => void
}

export function InboxListRegion({ collapsed = false, onExpand }: InboxListRegionProps) {
  const trayStories: TrayStory[] = []
  const isListLoading = false
  const isStoriesLoading = false
  const [focusSearch, setFocusSearch] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 pt-2">
        <Button size="icon" variant="ghost" aria-label="New conversation" onClick={() => setDialogOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
        {onExpand && (
          <button
            onClick={() => {
              setFocusSearch(true)
              onExpand()
            }}
            aria-label="Expand sidebar and search conversations"
            title="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-muted-foreground transition-colors hover:bg-foreground/20 hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
        {isListLoading ? null : <ConversationList collapsed />}
        <NewConversationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Chats
        </span>
        <Button size="icon-sm" variant="ghost" aria-label="New conversation" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <SearchBar autoFocus={focusSearch} />
      {isStoriesLoading ? (
        <StoryTraySkeleton />
      ) : trayStories.length === 0 ? (
        <p className="text-xs text-muted-foreground">Stories appear here</p>
      ) : (
        <StoryTray stories={trayStories} />
      )}
      {isListLoading ? null : <ConversationList />}
      <NewConversationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
