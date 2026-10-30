import { useCallback, useMemo, useState } from 'react'
import { ALL } from '../../../shared/config/constants'
import type { CategoryFilter } from '../../../entities/category/model/categories'
import type { DifficultyFilter, RecipeFilters } from './types'

/** Состояние поиска и фильтров, общее для главной и каталога. */
export function useRecipeFilters() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>(ALL)
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(ALL)

  const filters = useMemo<RecipeFilters>(() => ({ query, category, difficulty }), [query, category, difficulty])
  const isActive = query.trim() !== '' || category !== ALL || difficulty !== ALL

  const reset = useCallback(() => {
    setQuery('')
    setCategory(ALL)
    setDifficulty(ALL)
  }, [])

  return { filters, setQuery, setCategory, setDifficulty, isActive, reset }
}
