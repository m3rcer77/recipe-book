import { Typography, Box } from '@mui/material'
import { recipes } from '../data'
import { RecipeCard } from '../components/RecipeCard'

export function Favorites() { return <div className="page"><Box className="page-header"><div><Typography variant="h2">Избранное</Typography><Typography className="muted">Рецепты, к которым хочется вернуться</Typography></div></Box><div className="recipe-grid">{recipes.slice(0, 2).map(r => <RecipeCard key={r.id} recipe={r} />)}</div></div> }
