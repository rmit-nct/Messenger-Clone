// InboxListRegion — sidebar slot: story tray + search + conversation list (shell sidebar + mobile drawer route)
// Accepts `collapsed` so icon-rail mode drops text and centers avatars; search becomes a circular
// icon button that expands the sidebar and focuses the real input.
import { useState } from 'react'
import { Search } from 'lucide-react'
import { SearchBar } from './search-bar'
import { ConversationList } from './conversation-list'
import { StoryTray, StoryTraySkeleton } from '../../stories' // stories barrel
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

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 pt-2">
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
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <SearchBar autoFocus={focusSearch} />
      {isStoriesLoading ? (
        <StoryTraySkeleton />
      ) : trayStories.length === 0 ? (
        <p className="text-xs text-muted-foreground">Stories appear here</p>
      ) : (
        <StoryTray stories={trayStories} />
      )}
      {isListLoading ? null : <ConversationList />}
    </div>
  )
}