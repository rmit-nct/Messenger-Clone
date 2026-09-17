// grouped search results: Conversations + People
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth'
import { Avatar } from '../../shared/ui/avatar'
import { Button } from '../../shared/ui/button'
import { usePresence } from '../../messaging'
import { inboxKey } from '../../shared/lib/query-keys'
import { useConversationList } from '../hooks/use-conversation-list'
import { useDebouncedSearch } from '../hooks/use-debounced-search'
import { createDirectConversation } from '../api/new-conversation'
import { ConversationItem } from './conversation-item'

interface SearchResultsProps {
  query: string
  onNavigate?: () => void
}

export function SearchResults({ query, onNavigate }: SearchResultsProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { conversations, isLoading } = useConversationList()
  const { results: people, isLoading: isLoadingPeople } = useDebouncedSearch(query, user?.id ?? '')
  const { onlineUserIds } = usePresence()
  const [creatingId, setCreatingId] = useState<string | null>(null)

  const term = query.trim().toLowerCase()
  const matchedConversations = conversations.filter((c) => {
    const name = c.type === 'group' ? (c.title ?? '') : (c.other_user?.display_name ?? '')
    return name.toLowerCase().includes(term)
  })

  async function startDirect(userId: string) {
    if (!user) return
    setCreatingId(userId)
    try {
      const id = await createDirectConversation(userId)
      await queryClient.invalidateQueries({ queryKey: inboxKey })
      onNavigate?.()
      navigate(`/conversation/${id}`)
    } finally {
      setCreatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <section>
        <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversations
        </h2>
        {isLoading ? (
          <p className="p-2 text-xs text-muted-foreground">Searching…</p>
        ) : matchedConversations.length === 0 ? (
          <p className="p-2 text-xs text-muted-foreground">No conversations found</p>
        ) : (
          <div className="mt-1 flex flex-col gap-1">
            {matchedConversations.map((c) => (
              <div key={c.id} onClick={onNavigate}>
                <ConversationItem
                  conversation={c}
                  online={c.member_ids.some((m) => m !== user?.id && onlineUserIds.has(m))}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          People
        </h2>
        {isLoadingPeople ? (
          <p className="p-2 text-xs text-muted-foreground">Searching…</p>
        ) : people.length === 0 ? (
          <p className="p-2 text-xs text-muted-foreground">No people found</p>
        ) : (
          <div className="mt-1 flex flex-col gap-1">
            {people.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted"
              >
                <Avatar name={person.display_name} src={person.avatar_url} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {person.display_name}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={creatingId === person.id}
                  onClick={() => void startDirect(person.id)}
                >
                  <UserPlus className="mr-1 h-3.5 w-3.5" /> Message
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
