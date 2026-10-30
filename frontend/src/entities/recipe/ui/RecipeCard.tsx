import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import { formatMinutes } from '../../../shared/lib/format'
import type { Recipe } from '../model/types'

type Props = {
  recipe: Recipe
  /** Слот для пользовательского действия (например, кнопка «в избранное») */
  action?: ReactNode
  /** Порядковый номер — задаёт задержку анимации появления */
  index?: number
}

export function RecipeCard({ recipe, action, index = 0 }: Props) {
  return (
    <Card className="recipe-card fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <div className="recipe-visual">{recipe.emoji}</div>
      <CardContent className="recipe-content">
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Chip label={recipe.category} size="small" className="category-chip" />
          {action}
        </Stack>
        <Typography variant="h6" className="recipe-title">{recipe.title}</Typography>
        <Typography variant="body2" className="muted recipe-desc">{recipe.description}</Typography>
        <Stack direction="row" spacing={2} className="recipe-meta">
          <span><AccessTimeRoundedIcon fontSize="inherit" /> {formatMinutes(recipe.cookingTime)}</span>
          <span>{recipe.calories} ккал</span>
          <span>{recipe.difficulty}</span>
        </Stack>
        <Link to={`/recipes/${recipe.id}`} className="details-link">Открыть рецепт →</Link>
      </CardContent>
    </Card>
  )
}
