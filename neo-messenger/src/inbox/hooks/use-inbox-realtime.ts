import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../shared/lib/supabase/client'
import { inboxKey } from '../../shared/lib/query-keys'

export function useInboxRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const invalidate = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => queryClient.invalidateQueries({ queryKey: inboxKey }), 200)
    }

    const channel = supabase
      .channel(`inbox:changes:${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, invalidate)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_members' },
        invalidate,
      )
      .subscribe()

    return () => {
      if (timer) clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
