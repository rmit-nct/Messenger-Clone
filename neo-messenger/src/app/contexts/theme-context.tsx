// ThemeProvider — applies resolved theme (System/Light/Dark) to <html class="dark"> and persists choice.
import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, getSystem, type Theme } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('neo-theme') as Theme) || 'system')
  const [system, setSystem] = useState<'light' | 'dark'>(getSystem)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(getSystem())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved: 'light' | 'dark' = theme === 'system' ? system : theme

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('neo-theme', theme)
  }, [theme, resolved])

  return <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
}