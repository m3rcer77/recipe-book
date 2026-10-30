import type { ReactNode } from 'react'
import { DataState } from '../../../shared/ui/DataState'
import type { LoadStatus } from '../../../shared/lib/types'
import { RecipeCard } from '../../../entities/recipe/ui/RecipeCard'
import { RecipeGridSkeleton } from '../../../entities/recipe/ui/RecipeGridSkeleton'
import type { Recipe } from '../../../entities/recipe/model/types'
import { FavoriteButton } from '../../favorites/ui/FavoriteButton'

type Props = {
  recipes: Recipe[]
  status: LoadStatus
  error: string | null
  onRetry: () => void
  emptyTitle: string
  emptyText?: string
  emptyAction?: ReactNode
}

/** Сетка карточек с состояниями загрузки, ошибки и «нет данных» — используется на трёх страницах. */
export function RecipeList({ recipes, status, error, onRetry, emptyTitle, emptyText, emptyAction }: Props) {
  return (
    <DataState
      status={status}
      error={error}
      isEmpty={recipes.length === 0}
      onRetry={onRetry}
      skeleton={<RecipeGridSkeleton />}
      emptyTitle={emptyTitle}
      emptyText={emptyText}
      emptyAction={emptyAction}
    >
      <div className="recipe-grid">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={index} action={<FavoriteButton recipeId={recipe.id} />} />
        ))}
      </div>
    </DataState>
  )
}
