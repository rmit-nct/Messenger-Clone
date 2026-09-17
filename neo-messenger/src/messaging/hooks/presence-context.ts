import { createContext, useContext } from 'react'

interface PresenceValue {
  onlineUserIds: Set<string>
}

export const PresenceContext = createContext<PresenceValue>({ onlineUserIds: new Set() })

export function usePresence() {
  return useContext(PresenceContext)
}
