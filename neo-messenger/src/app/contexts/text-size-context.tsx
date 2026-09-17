// TextSizeProvider — applies the global UI scale to <html> and persists the choice.
import { useEffect, useState, type ReactNode } from 'react'
import {
  TEXT_SIZE_SCALE,
  TEXT_SIZE_STORAGE_KEY,
  TextSizeContext,
  parseTextSize,
  type TextSize,
} from './text-size'

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>(() =>
    parseTextSize(localStorage.getItem(TEXT_SIZE_STORAGE_KEY)),
  )

  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SIZE_SCALE[textSize]
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSize)
  }, [textSize])

  return <TextSizeContext.Provider value={{ textSize, setTextSize }}>{children}</TextSizeContext.Provider>
}
