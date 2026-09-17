// Text-size context + hook — non-jsx module (react-refresh only-export rule).
import { createContext, useContext } from 'react'

export type TextSize = 'sm' | 'default' | 'lg'

export interface TextSizeContextValue {
  textSize: TextSize
  setTextSize: (t: TextSize) => void
}

export const TEXT_SIZE_SCALE: Record<TextSize, string> = {
  sm: '87.5%',
  default: '100%',
  lg: '112.5%',
}

export const TEXT_SIZE_STORAGE_KEY = 'neo-text-size'

export function parseTextSize(value: string | null): TextSize {
  if (value === 'sm' || value === 'lg') return value
  return 'default'
}

export const TextSizeContext = createContext<TextSizeContextValue | null>(null)

export const useTextSize = () => {
  const ctx = useContext(TextSizeContext)
  if (!ctx) throw new Error('useTextSize must be used within TextSizeProvider')
  return ctx
}
