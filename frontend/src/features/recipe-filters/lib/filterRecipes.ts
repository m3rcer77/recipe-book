import { ALL } from '../../../shared/config/constants'
import type { Recipe } from '../../../entities/recipe/model/types'
import type { RecipeFilters } from '../model/types'

/** Чистая функция фильтрации: легко тестировать и использовать на любой странице. */
export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  const query = filters.query.trim().toLowerCase()
  return recipes.filter(
    (recipe) =>
      (filters.category === ALL || recipe.category === filters.category) &&
      (filters.difficulty === ALL || recipe.difficulty === filters.difficulty) &&
      (query === '' || `${recipe.title} ${recipe.description}`.toLowerCase().includes(query)),
  )
}
