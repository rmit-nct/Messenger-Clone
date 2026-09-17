import { useCallback, useEffect, useRef, useState } from 'react'
import type { StoryMedia } from '../../shared/types/database'

const DURATION_MS = 5000
const SEEN_AFTER_MS = 1000

interface PlaybackOptions {
  onSeen?: (story: StoryMedia) => void
  onEnd?: () => void
}

export function useStoryPlayback(stories: StoryMedia[], options: PlaybackOptions = {}) {
  const { onSeen, onEnd } = options
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const elapsedRef = useRef(0)
  const activeIdRef = useRef<string | null>(null)
  const seenRef = useRef<Set<string>>(new Set())

  const current = stories[index]

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(() => {
      if (!seenRef.current.has(current.id)) {
        seenRef.current.add(current.id)
        onSeen?.(current)
      }
    }, SEEN_AFTER_MS)
    return () => clearTimeout(timer)
  }, [current, onSeen])

  useEffect(() => {
    if (!current || paused) return
    if (activeIdRef.current !== current.id) {
      activeIdRef.current = current.id
      elapsedRef.current = 0
    }
    let raf = 0
    let last = Date.now()
    const tick = () => {
      const now = Date.now()
      elapsedRef.current += now - last
      last = now
      const pct = Math.min(100, (elapsedRef.current / DURATION_MS) * 100)
      setProgress(pct)
      if (pct >= 100) {
        if (index < stories.length - 1) setIndex((i) => i + 1)
        else onEnd?.()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [current, paused, index, stories.length, onEnd])

  const next = useCallback(() => {
    setIndex((i) => (i < stories.length - 1 ? i + 1 : i))
  }, [stories.length])

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : 0))
  }, [])

  const togglePause = useCallback(() => setPaused((p) => !p), [])

  return { index, progress, paused, next, prev, togglePause, setPaused, current }
}
