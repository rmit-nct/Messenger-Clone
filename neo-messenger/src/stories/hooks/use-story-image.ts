import { useEffect, useState } from 'react'
import { createSignedUrl } from '../../shared/lib/api/uploads'

const cache = new Map<string, string>()

export function useStoryImage(path: string | null | undefined): string | null {
  const [resolved, setResolved] = useState<{ path: string; url: string } | null>(() => {
    if (path && cache.has(path)) return { path, url: cache.get(path) as string }
    return null
  })

  useEffect(() => {
    if (!path || cache.has(path)) return
    let active = true
    createSignedUrl(path, 'stories')
      .then((url) => {
        cache.set(path, url)
        if (active) setResolved({ path, url })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [path])

  if (!path) return null
  const cached = cache.get(path)
  if (cached) return cached
  return resolved && resolved.path === path ? resolved.url : null
}
