import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth'
import { supabase } from '../../shared/lib/supabase/client'
import { activeStoriesKey } from '../../shared/lib/query-keys'
import { randomId } from '../../shared/lib/uuid'
import { fetchActiveStories } from '../api/stories'

export function useActiveStories() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: activeStoriesKey,
    queryFn: () => fetchActiveStories(userId),
    enabled: !!userId,
  })

  useEffect(() => {
    const channel = supabase
      .channel(`stories:changes:${randomId()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        void queryClient.invalidateQueries({ queryKey: activeStoriesKey })
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return {
    authors: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
