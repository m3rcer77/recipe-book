import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { demoApi as recipesApi } from '../api/demoApi'
import { getErrorMessage } from '../../../shared/lib/errors'
import type { LoadStatus } from '../../../shared/lib/types'
import type { Recipe, RecipeInput } from './types'

type RecipesContextValue = {
  recipes: Recipe[]
  status: LoadStatus
  error: string | null
  reload: () => void
  createRecipe: (input: RecipeInput) => Promise<Recipe>
  updateRecipe: (id: number, input: RecipeInput) => Promise<Recipe>
  deleteRecipe: (id: number) => Promise<void>
}

const RecipesContext = createContext<RecipesContextValue | null>(null)

/** Единый источник данных о рецептах для всех страниц. */
export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      setRecipes(await recipesApi.list())
      setStatus('success')
    } catch (e) {
      setError(getErrorMessage(e))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createRecipe = useCallback(async (input: RecipeInput) => {
    const created = await recipesApi.create(input)
    setRecipes((prev) => [...prev, created])
    return created
  }, [])

  const updateRecipe = useCallback(async (id: number, input: RecipeInput) => {
    const updated = await recipesApi.update(id, input)
    setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)))
    return updated
  }, [])

  const deleteRecipe = useCallback(async (id: number) => {
    await recipesApi.remove(id)
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const value = useMemo<RecipesContextValue>(
    () => ({ recipes, status, error, reload: () => void load(), createRecipe, updateRecipe, deleteRecipe }),
    [recipes, status, error, load, createRecipe, updateRecipe, deleteRecipe],
  )

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>
}

export function useRecipes(): RecipesContextValue {
  const ctx = useContext(RecipesContext)
  if (!ctx) throw new Error('useRecipes нужно использовать внутри RecipesProvider')
  return ctx
}
