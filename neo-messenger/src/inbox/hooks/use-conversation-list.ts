import { useQuery } from '@tanstack/react-query'
import { inboxKey } from '../../shared/lib/query-keys'
import { fetchInbox } from '../api/conversations'

export function useConversationList() {
  const query = useQuery({ queryKey: inboxKey, queryFn: fetchInbox })
  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
