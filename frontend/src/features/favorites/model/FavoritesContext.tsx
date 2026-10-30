import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { loadJson, saveJson } from '../../../shared/lib/storage'

type FavoritesContextValue = {
  ids: number[]
  isFavorite: (recipeId: number) => boolean
  toggle: (recipeId: number) => void
}

const STORAGE_KEY = 'recipe-book:favorites'
/** Начальное избранное для демонстрации (как на экране из лабораторной №1). */
const DEFAULT_IDS = [1, 2]

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(() => loadJson<number[]>(STORAGE_KEY, DEFAULT_IDS))

  useEffect(() => saveJson(STORAGE_KEY, ids), [ids])

  const toggle = useCallback((recipeId: number) => {
    setIds((prev) => (prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]))
  }, [])

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
