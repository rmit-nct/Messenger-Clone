import { useEffect, useState } from 'react'
import { createSignedUrl } from '../../shared/lib/api/uploads'

interface CacheEntry {
  url: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 55 * 60 * 1000
const MAX_ENTRIES = 200

function getCached(path: string): string | null {
  const entry = cache.get(path)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(path)
    return null
  }
  return entry.url
}

function setCached(path: string, url: string) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(path, { url, expiresAt: Date.now() + TTL_MS })
}

export function useStoryImage(path: string | null | undefined): string | null {
  const [resolved, setResolved] = useState<{ path: string; url: string } | null>(() => {
    if (!path) return null
    const cached = getCached(path)
    return cached ? { path, url: cached } : null
  })

  useEffect(() => {
    if (!path || getCached(path)) return
    let active = true
    createSignedUrl(path, 'stories')
      .then((url) => {
        setCached(path, url)
        if (active) setResolved({ path, url })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [path])

  if (!path) return null
  return getCached(path) ?? (resolved && resolved.path === path ? resolved.url : null)
}
