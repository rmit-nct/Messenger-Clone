import { useEffect, useState } from 'react'
import { createSignedUrl } from '../../shared/lib/api/uploads'

const cache = new Map<string, string>()

export function useSignedUrl(path: string | null | undefined): string | null {
  const [resolved, setResolved] = useState<{ path: string; url: string } | null>(() => {
    if (path && cache.has(path)) return { path, url: cache.get(path) as string }
    return null
  })

  useEffect(() => {
    if (!path || cache.has(path)) return
    let active = true
    createSignedUrl(path)
      .then((signed) => {
        cache.set(path, signed)
        if (active) setResolved({ path, url: signed })
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
