import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { getErrorMessage } from '../../../shared/lib/errors'
import type { IngredientItem } from '../../../entities/recipe/model/types'
import { validateRecipeForm } from './validation'
import type { RecipeFormValues } from './validation'

/**
 * Состояние формы рецепта.
 * Ошибка поля показывается после того, как пользователь покинул поле (blur)
 * или нажал «Сохранить» — так форма не «ругается» раньше времени.
 */
export function useRecipeForm(initial: RecipeFormValues, onSubmit: (values: RecipeFormValues) => Promise<void>) {
  const [values, setValues] = useState<RecipeFormValues>(initial)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const allErrors = useMemo(() => validateRecipeForm(values), [values])

  const errorFor = (key: string): string | undefined => (submitted || touched[key] ? allErrors[key] : undefined)
  const touch = (key: string) => setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }))

  /** Свойства для TextField: подсветка ошибки, текст под полем, отметка «поле посещено». */
  const fieldProps = (key: string) => {
    const message = errorFor(key)
    return { error: Boolean(message), helperText: message ?? ' ', onBlur: () => touch(key) }
  }

  const setField = <K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const updateIngredient = (index: number, patch: Partial<IngredientItem>) =>
    setValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))
  const addIngredient = () =>
    setValues((prev) => ({ ...prev, ingredients: [...prev.ingredients, { name: '', quantity: '' }] }))
  const removeIngredient = (index: number) =>
    setValues((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }))

  const updateStep = (index: number, text: string) =>
    setValues((prev) => ({ ...prev, steps: prev.steps.map((step, i) => (i === index ? text : step)) }))
  const addStep = () => setValues((prev) => ({ ...prev, steps: [...prev.steps, ''] }))
  const removeStep = (index: number) =>
    setValues((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(allErrors).length > 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (e) {
      setSubmitError(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    values,
    setField,
    errorFor,
    fieldProps,
    updateIngredient,
    addIngredient,
    removeIngredient,
    updateStep,
    addStep,
    removeStep,
    handleSubmit,
    submitting,
    submitError,
  }
}
