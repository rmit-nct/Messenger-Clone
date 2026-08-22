// Theme context + hook — non-jsx module so react-refresh only-export rule stays clean.
// Keep components out; the Provider lives in theme-context.tsx.
import { createContext, useContext } from 'react'

export type Theme = 'system' | 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function getSystem(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}