import type { All } from '../../../shared/config/constants'
import type { CategoryFilter } from '../../../entities/category/model/categories'
import type { Difficulty } from '../../../entities/recipe/model/types'

export type DifficultyFilter = Difficulty | All

export type RecipeFilters = {
  query: string
  category: CategoryFilter
  difficulty: DifficultyFilter
}
