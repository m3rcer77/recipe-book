import { CATEGORIES } from '../../../entities/category/model/categories'
import type { Category } from '../../../entities/category/model/categories'
import type { Difficulty, IngredientItem, Recipe, RecipeInput } from '../../../entities/recipe/model/types'

export const EMOJI_OPTIONS = ['🍽️', '🍝', '🥞', '🍗', '🍫', '🥗', '🍲', '🍰', '🍳', '🍕', '🥘', '🥪']

/** Значения полей формы хранятся строками — так их удобно вводить и проверять. */
export type RecipeFormValues = {
  title: string
  description: string
  emoji: string
  category: Category | ''
  cookingTime: string
  difficulty: Difficulty
  calories: string
  ingredients: IngredientItem[]
  steps: string[]
}

/** Ключ поля -> текст ошибки. Для строк списков ключ вида «ingredients.0.name», «steps.1». */
export type FormErrors = Record<string, string>

export function emptyValues(): RecipeFormValues {
  return {
    title: '',
    description: '',
    emoji: EMOJI_OPTIONS[0],
    category: '',
    cookingTime: '',
    difficulty: 'Легко',
    calories: '',
    ingredients: [{ name: '', quantity: '' }],
    steps: [''],
  }
}

export function valuesFromRecipe(recipe: Recipe): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description,
    emoji: recipe.emoji,
    category: recipe.category,
    cookingTime: String(recipe.cookingTime),
    difficulty: recipe.difficulty,
    calories: String(recipe.calories),
    ingredients: recipe.ingredients.map((item) => ({ ...item })),
    steps: [...recipe.steps],
  }
}

const isWholeNumber = (value: string): boolean => /^\d+$/.test(value.trim())

function validateNumber(raw: string, min: number, max: number, emptyMessage: string, unit: string): string | undefined {
  if (!raw.trim()) return emptyMessage
  if (!isWholeNumber(raw)) return 'Введите целое число'
  const n = Number(raw)
  if (n < min || n > max) return `Допустимо от ${min} до ${max} ${unit}`
  return undefined
}

export function validateRecipeForm(values: RecipeFormValues): FormErrors {
  const errors: FormErrors = {}

  const title = values.title.trim()
  if (!title) errors.title = 'Введите название рецепта'
  else if (title.length < 3) errors.title = 'Название слишком короткое (минимум 3 символа)'
  else if (title.length > 80) errors.title = 'Название слишком длинное (максимум 80 символов)'

  const description = values.description.trim()
  if (!description) errors.description = 'Добавьте краткое описание'
  else if (description.length < 10) errors.description = 'Опишите блюдо подробнее (минимум 10 символов)'
  else if (description.length > 300) errors.description = 'Описание слишком длинное (максимум 300 символов)'

  if (!values.category || !CATEGORIES.includes(values.category)) errors.category = 'Выберите категорию'

  const timeError = validateNumber(values.cookingTime, 1, 600, 'Укажите время приготовления', 'мин')
  if (timeError) errors.cookingTime = timeError

  const caloriesError = validateNumber(values.calories, 0, 5000, 'Укажите калорийность', 'ккал')
  if (caloriesError) errors.calories = caloriesError

  if (values.ingredients.length === 0) errors.ingredients = 'Добавьте хотя бы один ингредиент'
  const seen = new Set<string>()
  values.ingredients.forEach((item, index) => {
    const name = item.name.trim()
    const quantity = item.quantity.trim()
    if (!name) errors[`ingredients.${index}.name`] = 'Введите название'
    else if (name.length > 50) errors[`ingredients.${index}.name`] = 'Не более 50 символов'
    else if (seen.has(name.toLowerCase())) errors[`ingredients.${index}.name`] = 'Этот ингредиент уже добавлен'
    seen.add(name.toLowerCase())

    if (!quantity) errors[`ingredients.${index}.quantity`] = 'Укажите количество'
    else if (quantity.length > 30) errors[`ingredients.${index}.quantity`] = 'Не более 30 символов'
  })

  if (values.steps.length === 0) errors.steps = 'Добавьте хотя бы один шаг'
  values.steps.forEach((step, index) => {
    const text = step.trim()
    if (!text) errors[`steps.${index}`] = 'Опишите шаг'
    else if (text.length > 300) errors[`steps.${index}`] = 'Не более 300 символов'
  })

  return errors
}

/** Преобразует корректно заполненную форму в данные рецепта. Вызывать только после validateRecipeForm без ошибок. */
export function toRecipeInput(values: RecipeFormValues): RecipeInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    emoji: values.emoji,
    category: values.category as Category,
    cookingTime: Number(values.cookingTime),
    difficulty: values.difficulty,
    calories: Number(values.calories),
    ingredients: values.ingredients.map((item) => ({ name: item.name.trim(), quantity: item.quantity.trim() })),
    steps: values.steps.map((step) => step.trim()),
  }
}
