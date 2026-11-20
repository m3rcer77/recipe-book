import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { loadJson, saveJson } from '../../../shared/lib/storage'
import { useAuth } from '../../../entities/session/model/AuthContext'

type FavoritesContextValue = {
  ids: number[]
  isFavorite: (recipeId: number) => boolean
  toggle: (recipeId: number) => void
}

/** Избранное хранится отдельно для каждого пользователя: после смены аккаунта списки не смешиваются. */
const storageKey = (userId: number) => `recipe-book:favorites:${userId}`

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [ids, setIds] = useState<number[]>([])

  // Вход, выход или смена пользователя: загружаем его список (или пустой, если не вошли)
  useEffect(() => {
    setIds(userId === null ? [] : loadJson<number[]>(storageKey(userId), []))
  }, [userId])

  const toggle = useCallback(
    (recipeId: number) => {
      if (userId === null) return
      const next = ids.includes(recipeId) ? ids.filter((id) => id !== recipeId) : [...ids, recipeId]
      setIds(next)
      saveJson(storageKey(userId), next)
    },
    [ids, userId],
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({ ids, isFavorite: (recipeId) => ids.includes(recipeId), toggle }),
    [ids, toggle],
  )
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites нужно использовать внутри FavoritesProvider')
  return ctx
}
