import { useState, useEffect } from 'react'
import { searchUsers } from '../../shared/lib/api/users'
import { useDebounce } from '../../shared/hooks/use-debounce'
import type { Member } from '../../shared/types/database'

export function useDebouncedSearch(query: string, excludeId: string) {
  const debounced = useDebounce(query, 300)
  const [loaded, setLoaded] = useState<{ key: string; results: Member[] } | null>(null)

  const key = `${excludeId}:${debounced}`

  useEffect(() => {
    let active = true
    searchUsers(debounced, excludeId)
      .then((users) => {
        if (active) setLoaded({ key, results: users })
      })
      .catch(() => {
        if (active) setLoaded({ key, results: [] })
      })
    return () => {
      active = false
    }
  }, [debounced, excludeId, key])

  return { results: loaded?.results ?? [], isLoading: loaded?.key !== key }
}
