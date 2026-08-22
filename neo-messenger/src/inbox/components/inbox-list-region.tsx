// InboxListRegion — sidebar slot: story tray + search + conversation list (shared by shell sidebar + mobile drawer route)
import { SearchBar } from './search-bar'
import { ConversationList } from './conversation-list'
import { StoryTray, StoryTraySkeleton } from '../../stories'  // stories barrel
import type { TrayStory } from '../../stories'

export function InboxListRegion() {
  const trayStories: TrayStory[] = []
  const isListLoading = false
  const isStoriesLoading = false
  return (
    <div className="flex flex-col gap-3 p-3">
      <SearchBar />
      {isStoriesLoading ? <StoryTraySkeleton /> : trayStories.length === 0 ? (
        <p className="text-xs text-muted-foreground">Stories appear here</p>
      ) : (
        <StoryTray stories={trayStories} />
      )}
      {isListLoading ? null : <ConversationList />}
    </div>
  )
}