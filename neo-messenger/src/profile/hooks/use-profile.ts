import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth'
import { inboxKey, profileKey } from '../../shared/lib/query-keys'
import { fetchProfile, updateProfile } from '../api/profile'

export function useProfile(userId: string) {
  const query = useQuery({
    queryKey: profileKey(userId),
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  })
  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export function useMyProfile() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const query = useQuery({
    queryKey: profileKey(userId),
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  })
  return { profile: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch }
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (changes: { display_name?: string; avatar_url?: string }) =>
      updateProfile(userId, changes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKey(userId) })
      void queryClient.invalidateQueries({ queryKey: inboxKey })
    },
  })
}