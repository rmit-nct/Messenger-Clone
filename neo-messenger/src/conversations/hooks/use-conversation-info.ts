import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { conversationKey, conversationMediaKey, inboxKey } from '../../shared/lib/query-keys'
import {
  addConversationMembers,
  removeConversationMember,
  setConversationAdmin,
} from '../api/members'
import { fetchConversationMedia, updateConversation } from '../api/group-info'

export function useConversationInfo(conversationId: string) {
  const queryClient = useQueryClient()

  const mediaQuery = useQuery({
    queryKey: conversationMediaKey(conversationId),
    queryFn: () => fetchConversationMedia(conversationId),
    enabled: !!conversationId,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: conversationKey(conversationId) })
    void queryClient.invalidateQueries({ queryKey: inboxKey })
  }

  const addMutation = useMutation({
    mutationFn: (userIds: string[]) => addConversationMembers(conversationId, userIds),
    onSuccess: invalidate,
  })
  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeConversationMember(conversationId, userId),
    onSuccess: invalidate,
  })
  const adminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      setConversationAdmin(conversationId, userId, isAdmin),
    onSuccess: invalidate,
  })
  const updateMutation = useMutation({
    mutationFn: (changes: { title?: string; imagePath?: string }) =>
      updateConversation(conversationId, changes),
    onSuccess: invalidate,
  })

  return {
    media: mediaQuery.data ?? [],
    isLoadingMedia: mediaQuery.isLoading,
    mediaError: mediaQuery.isError,
    refetchMedia: mediaQuery.refetch,
    addMembers: (userIds: string[]) => addMutation.mutateAsync(userIds),
    removeMember: (userId: string) => removeMutation.mutateAsync(userId),
    setAdmin: (userId: string, isAdmin: boolean) => adminMutation.mutateAsync({ userId, isAdmin }),
    updateInfo: (changes: { title?: string; imagePath?: string }) =>
      updateMutation.mutateAsync(changes),
    isMutating:
      addMutation.isPending ||
      removeMutation.isPending ||
      adminMutation.isPending ||
      updateMutation.isPending,
  }
}
