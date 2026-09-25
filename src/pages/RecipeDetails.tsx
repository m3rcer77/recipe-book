import { Link, useParams } from 'react-router-dom'
import { Box, Button, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { recipes } from '../data'

export function RecipeDetails() {
  const { id } = useParams()
  const recipe = recipes.find(r => r.id === Number(id)) ?? recipes[0]
  return <div className="page detail-page"><Button component={Link} to="/recipes" startIcon={<ArrowBackRoundedIcon />} className="back-button">Назад к рецептам</Button><section className="detail-hero"><div className="detail-emoji">{recipe.emoji}</div><div className="detail-info"><Chip label={recipe.category} className="category-chip" /><Typography variant="h2">{recipe.title}</Typography><Typography className="detail-description">{recipe.description}</Typography><Stack direction="row" spacing={2} className="detail-meta"><span><AccessTimeRoundedIcon /> {recipe.time}</span><span>{recipe.calories} ккал</span><span>{recipe.difficulty}</span></Stack><Button variant="contained" startIcon={<FavoriteBorderRoundedIcon />}>Сохранить в избранное</Button></div></section><Divider /><section className="recipe-columns"><div><Typography variant="h4">Ингредиенты</Typography><List>{recipe.ingredients.map(item => <ListItem key={item} disableGutters><ListItemIcon><CheckCircleOutlineRoundedIcon /></ListItemIcon><ListItemText primary={item} /></ListItem>)}</List></div><div><Typography variant="h4">Как приготовить</Typography><List>{recipe.steps.map((step, i) => <ListItem key={step} disableGutters alignItems="flex-start"><ListItemIcon><span className="step-number">{i + 1}</span></ListItemIcon><ListItemText primary={step} /></ListItem>)}</List></div></section><Box className="tip-box"><strong>Совет:</strong> подготовь все ингредиенты заранее — так процесс приготовления будет спокойнее и быстрее.</Box></div>
}
