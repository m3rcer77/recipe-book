import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Stack, Typography } from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog'
import { DataState } from '../../shared/ui/DataState'
import { useToast } from '../../shared/ui/ToastProvider'
import { getErrorMessage } from '../../shared/lib/errors'
import { formatMinutes } from '../../shared/lib/format'
import { useRecipes } from '../../entities/recipe/model/RecipesContext'
import type { Recipe, RecipeInput } from '../../entities/recipe/model/types'
import { FavoriteButton } from '../../features/favorites/ui/FavoriteButton'
import { RecipeFormDialog } from '../../features/recipe-form/ui/RecipeFormDialog'
import { valuesFromRecipe } from '../../features/recipe-form/model/validation'

export function RecipeDetailsPage() {
  const { id } = useParams()
  const { recipes, status, error, reload } = useRecipes()
  const recipe = recipes.find((r) => r.id === Number(id))

  return (
    <div className="page detail-page">
      <Button component={Link} to="/recipes" startIcon={<ArrowBackRoundedIcon />} className="back-button">
        Назад к рецептам
      </Button>
      <DataState
        status={status}
        error={error}
        isEmpty={!recipe}
        onRetry={reload}
        skeleton={<DetailSkeleton />}
        emptyIcon="🔍"
        emptyTitle="Рецепт не найден"
        emptyText="Возможно, он был удалён или ссылка неверна."
        emptyAction={<Button component={Link} to="/recipes" variant="contained">К списку рецептов</Button>}
      >
        {recipe ? <RecipeContent recipe={recipe} /> : null}
      </DataState>
    </div>
  )
}

function RecipeContent({ recipe }: { recipe: Recipe }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { updateRecipe, deleteRecipe } = useRecipes()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  /** Какие ингредиенты пользователь уже подготовил (отмечены галочкой) */
  const [checked, setChecked] = useState<string[]>([])

  const toggleChecked = (name: string) =>
    setChecked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))

  const handleUpdate = async (input: RecipeInput) => {
    await updateRecipe(recipe.id, input)
    setEditOpen(false)
    toast('Изменения сохранены')
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteRecipe(recipe.id)
      toast('Рецепт удалён', 'info')
      navigate('/recipes')
    } catch (e) {
      setDeleting(false)
      setConfirmOpen(false)
      toast(getErrorMessage(e), 'error')
    }
  }

  return (
    <div className="fade-in-up">
      <section className="detail-hero">
        <div className="detail-emoji">{recipe.emoji}</div>
        <div className="detail-info">
          <Chip label={recipe.category} className="category-chip" />
          <Typography variant="h2">{recipe.title}</Typography>
          <Typography className="detail-description">{recipe.description}</Typography>
          <Stack direction="row" spacing={2} className="detail-meta">
            <span><AccessTimeRoundedIcon /> {formatMinutes(recipe.cookingTime)}</span>
            <span>{recipe.calories} ккал</span>
            <span>{recipe.difficulty}</span>
          </Stack>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
            <FavoriteButton recipeId={recipe.id} variant="button" />
            <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setEditOpen(true)}>Редактировать</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setConfirmOpen(true)}>Удалить</Button>
          </Stack>
        </div>
      </section>
      <Divider />
      <section className="recipe-columns">
        <div>
          <Typography variant="h4">Ингредиенты</Typography>
          <Typography className="muted" variant="body2">Нажимайте на ингредиент, чтобы отметить, что он готов</Typography>
          <List>
            {recipe.ingredients.map((item) => {
              const isChecked = checked.includes(item.name)
              return (
                <ListItem key={item.name} disableGutters disablePadding>
                  <ListItemButton
                    onClick={() => toggleChecked(item.name)}
                    className={isChecked ? 'ingredient-item checked' : 'ingredient-item'}
                    aria-pressed={isChecked}
                  >
                    <ListItemIcon>{isChecked ? <CheckCircleRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}</ListItemIcon>
                    <ListItemText primary={`${item.name} — ${item.quantity}`} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </div>
        <div>
          <Typography variant="h4">Как приготовить</Typography>
          <List>
            {recipe.steps.map((step, i) => (
              <ListItem key={i} disableGutters alignItems="flex-start">
                <ListItemIcon><span className="step-number">{i + 1}</span></ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </div>
      </section>
      <Box className="tip-box">
        <strong>Совет:</strong> подготовь все ингредиенты заранее — так процесс приготовления будет спокойнее и быстрее.
      </Box>

      <RecipeFormDialog
        open={editOpen}
        title="Редактирование рецепта"
        submitLabel="Сохранить"
        initial={valuesFromRecipe(recipe)}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Удалить рецепт?"
        text={`Рецепт «${recipe.title}» будет удалён без возможности восстановления.`}
        confirmLabel="Удалить"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}

function DetailSkeleton() {
  return (
    <section className="detail-hero">
      <Skeleton variant="rounded" className="detail-emoji" animation="wave" />
      <div className="detail-info">
        <Skeleton width={120} height={32} />
        <Skeleton width="80%" height={64} />
        <Skeleton width="100%" />
        <Skeleton width="60%" />
      </div>
    </section>
  )
}
