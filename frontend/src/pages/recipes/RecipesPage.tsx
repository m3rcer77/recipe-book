import { useMemo, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useToast } from '../../shared/ui/ToastProvider'
import { useRecipes } from '../../entities/recipe/model/RecipesContext'
import type { RecipeInput } from '../../entities/recipe/model/types'
import { RecipeList } from '../../features/recipe-list/ui/RecipeList'
import { SearchField } from '../../features/recipe-filters/ui/SearchField'
import { CategoryChips } from '../../features/recipe-filters/ui/CategoryChips'
import { DifficultySelect } from '../../features/recipe-filters/ui/DifficultySelect'
import { useRecipeFilters } from '../../features/recipe-filters/model/useRecipeFilters'
import { filterRecipes } from '../../features/recipe-filters/lib/filterRecipes'
import { RecipeFormDialog } from '../../features/recipe-form/ui/RecipeFormDialog'
import { emptyValues } from '../../features/recipe-form/model/validation'

export function RecipesPage() {
  const { recipes, status, error, reload, createRecipe } = useRecipes()
  const { filters, setQuery, setCategory, setDifficulty, isActive, reset } = useRecipeFilters()
  const toast = useToast()
  const [formOpen, setFormOpen] = useState(false)

  const filtered = useMemo(() => filterRecipes(recipes, filters), [recipes, filters])

  const handleCreate = async (input: RecipeInput) => {
    await createRecipe(input)
    setFormOpen(false)
    toast('Рецепт добавлен')
  }

  const openForm = () => setFormOpen(true)

  return (
    <div className="page">
      <Box className="page-header">
        <div>
          <Typography variant="h2">Все рецепты</Typography>
          <Typography className="muted">Найди блюдо по вкусу и настроению</Typography>
        </div>
        <Box className="page-actions">
          <SearchField value={filters.query} onChange={setQuery} size="small" />
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openForm} className="add-button">
            Добавить рецепт
          </Button>
        </Box>
      </Box>

      <Box className="filters">
        <CategoryChips value={filters.category} onChange={setCategory} />
        <DifficultySelect value={filters.difficulty} onChange={setDifficulty} />
      </Box>

      {status === 'success' && (
        <Typography className="muted results-count" aria-live="polite">
          Найдено рецептов: {filtered.length}
          {isActive && <Button size="small" onClick={reset}>Сбросить фильтры</Button>}
        </Typography>
      )}

      <RecipeList
        recipes={filtered}
        status={status}
        error={error}
        onRetry={reload}
        emptyTitle={isActive ? 'Ничего не найдено' : 'Пока нет рецептов'}
        emptyText={isActive ? 'Попробуйте изменить запрос или фильтры.' : 'Добавьте первый рецепт, чтобы он появился здесь.'}
        emptyAction={
          isActive ? (
            <Button onClick={reset}>Сбросить фильтры</Button>
          ) : (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openForm}>Добавить рецепт</Button>
          )
        }
      />

      <RecipeFormDialog
        open={formOpen}
        title="Новый рецепт"
        submitLabel="Добавить рецепт"
        initial={emptyValues()}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
