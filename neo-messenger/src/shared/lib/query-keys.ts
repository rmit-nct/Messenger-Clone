export const inboxKey = ['inbox'] as const
export const conversationKey = (id: string) => ['conversation', id] as const
export const messagesKey = (id: string) => ['messages', id] as const
export const conversationMediaKey = (id: string) => ['conversation-media', id] as const
export const profileKey = (id: string) => ['profile', id] as const
export const activeStoriesKey = ['active-stories'] as const
export const userStoriesKey = (userId: string) => ['user-stories', userId] as const
