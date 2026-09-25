import { Link } from 'react-router-dom'
import { Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import { Recipe } from '../data'

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="recipe-card">
      <div className="recipe-visual">{recipe.emoji}</div>
      <CardContent className="recipe-content">
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Chip label={recipe.category} size="small" className="category-chip" />
          <IconButton size="small" aria-label="Добавить в избранное"><FavoriteBorderRoundedIcon /></IconButton>
        </Stack>
        <Typography variant="h6" className="recipe-title">{recipe.title}</Typography>
        <Typography variant="body2" className="muted">{recipe.description}</Typography>
        <Stack direction="row" spacing={2} className="recipe-meta">
          <span><AccessTimeRoundedIcon fontSize="inherit" /> {recipe.time}</span>
          <span>{recipe.calories} ккал</span>
        </Stack>
        <Link to={`/recipes/${recipe.id}`} className="details-link">Открыть рецепт →</Link>
      </CardContent>
    </Card>
  )
}
