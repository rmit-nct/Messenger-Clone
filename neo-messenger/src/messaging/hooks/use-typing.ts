import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../shared/lib/supabase/client'
import { conversationChannel, TYPING_EVENT } from '../../shared/constants/realtime'
import { TYPING_IDLE_MS, TYPING_THROTTLE_MS } from '../../shared/constants/limits'
import type { Member } from '../../shared/types/database'

interface TypingPayload {
  user_id: string
  display_name: string
  avatar_url: string | null
}

export function useTyping(conversationId: string, currentUser: Member) {
  const [typingUsers, setTypingUsers] = useState<Member[]>([])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const lastSentRef = useRef(0)
  const timeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    if (!conversationId) return

    const clearTyper = (userId: string) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== userId))
      const timeout = timeoutsRef.current.get(userId)
      if (timeout) {
        clearTimeout(timeout)
        timeoutsRef.current.delete(userId)
      }
    }

    const channel = supabase
      .channel(conversationChannel(conversationId))
      .on('broadcast', { event: TYPING_EVENT }, ({ payload }) => {
        const data = payload as TypingPayload
        if (data.user_id === currentUser.id) return
        setTypingUsers((prev) =>
          prev.some((u) => u.id === data.user_id)
            ? prev
            : [...prev, { id: data.user_id, display_name: data.display_name, avatar_url: data.avatar_url }],
        )
        const existing = timeoutsRef.current.get(data.user_id)
        if (existing) clearTimeout(existing)
        timeoutsRef.current.set(
          data.user_id,
          setTimeout(() => clearTyper(data.user_id), TYPING_IDLE_MS),
        )
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      timeoutsRef.current.clear()
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUser.id, currentUser.display_name, currentUser.avatar_url])

  const notifyTyping = useCallback(() => {
    const channel = channelRef.current
    if (!channel) return
    const now = Date.now()
    if (now - lastSentRef.current < TYPING_THROTTLE_MS) return
    lastSentRef.current = now
    void channel.send({
      type: 'broadcast',
      event: TYPING_EVENT,
      payload: {
        user_id: currentUser.id,
        display_name: currentUser.display_name,
        avatar_url: currentUser.avatar_url,
      } satisfies TypingPayload,
    })
  }, [currentUser])

  return { typingUsers, notifyTyping }
}
