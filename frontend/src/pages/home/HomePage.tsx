import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Chip, Typography } from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useRecipes } from '../../entities/recipe/model/RecipesContext'
import { RecipeList } from '../../features/recipe-list/ui/RecipeList'
import { SearchField } from '../../features/recipe-filters/ui/SearchField'
import { CategoryChips } from '../../features/recipe-filters/ui/CategoryChips'
import { useRecipeFilters } from '../../features/recipe-filters/model/useRecipeFilters'
import { filterRecipes } from '../../features/recipe-filters/lib/filterRecipes'

export function HomePage() {
  const { recipes, status, error, reload } = useRecipes()
  const { filters, setQuery, setCategory, isActive, reset } = useRecipeFilters()
  const filtered = useMemo(() => filterRecipes(recipes, filters), [recipes, filters])

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <Chip label="Новая коллекция рецептов" className="hero-chip" />
          <Typography variant="h1">Готовь вкусно.<br /><span>Живи проще.</span></Typography>
          <Typography className="hero-subtitle">
            Собрали понятные рецепты на каждый день — от быстрого завтрака до уютного ужина.
          </Typography>
          <SearchField value={filters.query} onChange={setQuery} placeholder="Найти рецепт..." className="search-field" />
          <Box className="hero-actions">
            <Button component={Link} to="/recipes" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
              Смотреть рецепты
            </Button>
            <Button component={Link} to="/favorites" variant="text">Мои сохранённые</Button>
          </Box>
        </div>
        <div className="hero-art">
          <div className="hero-plate">🥗</div>
          <div className="floating-card top">⭐ 4.9<br /><small>рейтинг рецептов</small></div>
          <div className="floating-card bottom">⏱ 20 мин<br /><small>среднее время</small></div>
        </div>
      </section>

      <section className="section-block">
        <Box className="section-heading">
          <div>
            <Typography variant="h4">Категории</Typography>
            <Typography className="muted">Выбери настроение на сегодня</Typography>
          </div>
        </Box>
        <CategoryChips value={filters.category} onChange={setCategory} />
      </section>

      <section className="section-block">
        <Box className="section-heading">
          <div>
            <Typography variant="h4">Популярные рецепты</Typography>
            <Typography className="muted">Простые блюда, которые любят готовить дома</Typography>
          </div>
          <Button component={Link} to="/recipes">Все рецепты →</Button>
        </Box>
        <RecipeList
          recipes={filtered.slice(0, 4)}
          status={status}
          error={error}
          onRetry={reload}
          emptyTitle={isActive ? 'Ничего не найдено' : 'Пока нет рецептов'}
          emptyText={isActive ? 'Попробуйте изменить запрос или выбрать другую категорию.' : 'Добавьте первый рецепт на странице «Рецепты».'}
          emptyAction={
            isActive ? (
              <Button onClick={reset}>Сбросить фильтры</Button>
            ) : (
              <Button component={Link} to="/recipes" variant="contained">К рецептам</Button>
            )
          }
        />
      </section>
    </div>
  )
}
