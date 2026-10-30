import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { SlideUpTransition } from '../../../shared/ui/transitions'
import { CATEGORIES } from '../../../entities/category/model/categories'
import type { Category } from '../../../entities/category/model/categories'
import { DIFFICULTIES } from '../../../entities/recipe/model/types'
import type { Difficulty, RecipeInput } from '../../../entities/recipe/model/types'
import { useRecipeForm } from '../model/useRecipeForm'
import { EMOJI_OPTIONS, toRecipeInput } from '../model/validation'
import type { RecipeFormValues } from '../model/validation'

type Props = {
  open: boolean
  title: string
  submitLabel: string
  initial: RecipeFormValues
  onClose: () => void
  /** Должна завершиться успешно или бросить ошибку — она будет показана в форме */
  onSubmit: (input: RecipeInput) => Promise<void>
}

export function RecipeFormDialog({ open, onClose, ...formProps }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slots={{ transition: SlideUpTransition }}
      aria-labelledby="recipe-form-title"
    >
      {/* Внутренняя форма размонтируется при закрытии, поэтому при каждом открытии начинает с чистого состояния */}
      <RecipeForm {...formProps} onClose={onClose} />
    </Dialog>
  )
}

function RecipeForm({ title, submitLabel, initial, onClose, onSubmit }: Omit<Props, 'open'>) {
  const form = useRecipeForm(initial, (values) => onSubmit(toRecipeInput(values)))
  const { values, setField } = form

  return (
    <form noValidate onSubmit={form.handleSubmit} className="dialog-form">
      <DialogTitle id="recipe-form-title">{title}</DialogTitle>
      <DialogContent dividers>
        <Collapse in={Boolean(form.submitError)}>
          <Alert severity="error" sx={{ mb: 2 }}>{form.submitError}</Alert>
        </Collapse>

        <div className="form-grid">
          <TextField
            label="Название"
            required
            fullWidth
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            {...form.fieldProps('title')}
            className="form-wide"
          />
          <TextField
            label="Описание"
            required
            fullWidth
            multiline
            minRows={2}
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
            {...form.fieldProps('description')}
            className="form-wide"
          />
          <TextField
            select
            label="Категория"
            required
            fullWidth
            value={values.category}
            onChange={(e) => setField('category', e.target.value as Category)}
            {...form.fieldProps('category')}
          >
            {CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Сложность"
            fullWidth
            value={values.difficulty}
            onChange={(e) => setField('difficulty', e.target.value as Difficulty)}
            helperText=" "
          >
            {DIFFICULTIES.map((level) => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Время, мин"
            required
            fullWidth
            value={values.cookingTime}
            onChange={(e) => setField('cookingTime', e.target.value)}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            {...form.fieldProps('cookingTime')}
          />
          <TextField
            label="Калории, ккал"
            required
            fullWidth
            value={values.calories}
            onChange={(e) => setField('calories', e.target.value)}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            {...form.fieldProps('calories')}
          />
          <TextField
            select
            label="Иконка"
            fullWidth
            value={values.emoji}
            onChange={(e) => setField('emoji', e.target.value)}
            helperText=" "
          >
            {EMOJI_OPTIONS.map((emoji) => (
              <MenuItem key={emoji} value={emoji}>{emoji}</MenuItem>
            ))}
          </TextField>
        </div>

        <Typography variant="h6" className="form-section-title">Ингредиенты</Typography>
        {values.ingredients.map((item, index) => (
          <div className="dynamic-row" key={index}>
            <TextField
              label="Ингредиент"
              size="small"
              value={item.name}
              onChange={(e) => form.updateIngredient(index, { name: e.target.value })}
              {...form.fieldProps(`ingredients.${index}.name`)}
              sx={{ flex: 2 }}
            />
            <TextField
              label="Количество"
              size="small"
              value={item.quantity}
              onChange={(e) => form.updateIngredient(index, { quantity: e.target.value })}
              {...form.fieldProps(`ingredients.${index}.quantity`)}
              sx={{ flex: 1 }}
            />
            <IconButton aria-label="Удалить ингредиент" onClick={() => form.removeIngredient(index)}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </div>
        ))}
        {form.errorFor('ingredients') && <FormHelperText error>{form.errorFor('ingredients')}</FormHelperText>}
        <Button startIcon={<AddRoundedIcon />} onClick={form.addIngredient}>Добавить ингредиент</Button>

        <Typography variant="h6" className="form-section-title">Шаги приготовления</Typography>
        {values.steps.map((step, index) => (
          <div className="dynamic-row" key={index}>
            <TextField
              label={`Шаг ${index + 1}`}
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={step}
              onChange={(e) => form.updateStep(index, e.target.value)}
              {...form.fieldProps(`steps.${index}`)}
            />
            <IconButton aria-label="Удалить шаг" onClick={() => form.removeStep(index)}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </div>
        ))}
        {form.errorFor('steps') && <FormHelperText error>{form.errorFor('steps')}</FormHelperText>}
        <Button startIcon={<AddRoundedIcon />} onClick={form.addStep}>Добавить шаг</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={form.submitting}>Отмена</Button>
        <Button type="submit" variant="contained" disabled={form.submitting}>
          {form.submitting ? 'Сохранение…' : submitLabel}
        </Button>
      </DialogActions>
    </form>
  )
}
