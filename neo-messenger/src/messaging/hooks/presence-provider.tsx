import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../shared/lib/supabase/client'
import { onlinePresenceChannel } from '../../shared/lib/supabase/realtime'
import { useAuth } from '@/auth'
import { PresenceContext } from './presence-context'

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    const channel = onlinePresenceChannel(user.id)
    channel
      .on('presence', { event: 'sync' }, () => {
        setOnlineUserIds(new Set(Object.keys(channel.presenceState())))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void channel.track({ user_id: user.id, online_at: new Date().toISOString() })
        }
      })
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return <PresenceContext.Provider value={{ onlineUserIds }}>{children}</PresenceContext.Provider>
}
