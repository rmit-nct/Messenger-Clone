export type MessageStatus = 'sending' | 'sent' | 'failed'
export type ConversationType = 'direct' | 'group'

export interface User {
    name: string
    email: string
    id: string
    created_at: string
}


export interface Profile {
    id: string
    display_name: string
    avatar_url: string | null
    created_at: string
}

export interface Conversation {
    id: string
    type: ConversationType
    title: string | null
    image_url: string | null
    created_by: string
    created_at: string
    last_message_at: string
}

export interface ConversationMember {
    conversation_id: string
    user_id: string
    joined_at: string
    last_read_at: string
}

export interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string | null
    is_deleted: boolean
    edited_at: string | null
    created_at: string
}

export interface Attachment {
    id: string
    message_id: string
    storage_path: string
    mime_type: string
    size: number
    created_at: string
}

export interface Story {
    id: string
    user_id: string
    image_path: string
    caption: string | null
    created_at: string
    expire_at: string
}
export interface StoryView {
    story_id: string
    viewer_id: string
    viewed_at: string
}

export interface MessageReaction {
    message_id: string
    user_id: string
    emoji: string
    created_at: string
}

export interface Member {
  id: string
  display_name: string
  avatar_url: string | null
}

export interface InboxConversation {
  id: string
  type: ConversationType
  title: string | null
  image_url: string | null
  last_message_at: string
  last_message_preview: string | null
  last_message_sender: string | null
  unread_count: number
  member_ids: string[]
  other_user: Member | null
}

export interface MessageWithMeta {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  is_deleted: boolean
  edited_at: string | null
  created_at: string
  status: MessageStatus
  sender: Member
  attachment: { storage_path: string; mime_type: string; size: number } | null
  reactions: { user_id: string; emoji: string }[]
}