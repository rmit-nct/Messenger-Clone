// Mock conversation rows for the 1.6 UI frame. REMOVE at task 2.5 when real query wires in
import type { Conversation } from '../shared/types/database'

export interface MockConversation extends Conversation {
  latestPreview: string
  unreadCount: number
  isTyping?: boolean
  participantNames: string[]
}

export const mockConversations: MockConversation[] = [
  {
    id: 'c1',
    type: 'group',
    title: 'Project Orion Sync',
    image_url: null,
    created_by: 'u1',
    created_at: '2026-08-20T10:00:00Z',
    last_message_at: '2026-08-22T10:42:00Z',
    latestPreview: 'Nova: The latest deployment looks good, standing by.',
    participantNames: ['Nova', 'Jax', 'System'],
    unreadCount: 3,
    isTyping: false,
  },
  {
    id: 'c2',
    type: 'group',
    title: 'Design Team',
    image_url: null,
    created_by: 'u2',
    created_at: '2026-08-10T09:00:00Z',
    last_message_at: '2026-08-21T16:20:00Z',
    latestPreview: 'Assets updated in the shared drive.',
    participantNames: ['Nova', 'You'],
    unreadCount: 0,
    isTyping: true,
  },
  {
    id: 'c3',
    type: 'direct',
    title: null,
    image_url: null,
    created_by: 'u3',
    created_at: '2026-08-01T12:00:00Z',
    last_message_at: '2026-08-19T08:05:00Z',
    latestPreview: '[Image] Deploy chart',
    participantNames: ['System'],
    unreadCount: 1,
    isTyping: false,
  },
]