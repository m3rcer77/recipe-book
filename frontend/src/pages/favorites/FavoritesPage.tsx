import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { useRecipes } from '../../entities/recipe/model/RecipesContext'
import { useFavorites } from '../../features/favorites/model/FavoritesContext'
import { RecipeList } from '../../features/recipe-list/ui/RecipeList'

export function FavoritesPage() {
  const { recipes, status, error, reload } = useRecipes()
  const { ids } = useFavorites()
  const favoriteRecipes = useMemo(() => recipes.filter((r) => ids.includes(r.id)), [recipes, ids])

  return (
    <div className="page">
      <Box className="page-header">
        <div>
          <Typography variant="h2">Избранное</Typography>
          <Typography className="muted">Рецепты, к которым хочется вернуться</Typography>
        </div>
      </Box>
      <RecipeList
        recipes={favoriteRecipes}
        status={status}
        error={error}
        onRetry={reload}
        emptyTitle="В избранном пока пусто"
        emptyText="Нажмите на сердечко у рецепта, чтобы сохранить его здесь."
        emptyAction={<Button component={Link} to="/recipes" variant="contained">Выбрать рецепты</Button>}
      />
    </div>
  )
}
