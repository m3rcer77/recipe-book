import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { getErrorMessage } from './errors'

type Errors<T> = Partial<Record<keyof T, string>>

/**
 * Состояние простой формы из текстовых полей: значения, ошибки валидации, отправка.
 * Ошибка поля показывается после ухода из поля или после нажатия «Отправить».
 * Ошибка отправки (например, ответ сервера) сохраняется в submitError, введённые данные остаются.
 */
export function useSimpleForm<T extends Record<string, string>>(
  initial: T,
  validate: (values: T) => Errors<T>,
  onSubmit: (values: T) => Promise<void>,
) {
  const [values, setValues] = useState<T>(initial)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const errors = validate(values)

  /** Свойства для TextField: значение, обработчики, подсветка ошибки и текст под полем. */
  const fieldProps = (key: keyof T) => {
    const message = submitted || touched[key] ? errors[key] : undefined
    return {
      value: values[key],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((prev) => ({ ...prev, [key]: event.target.value }) as T),
      onBlur: () => setTouched((prev) => ({ ...prev, [key]: true })),
      error: Boolean(message),
      helperText: message ?? ' ',
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
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

  return { values, fieldProps, handleSubmit, submitting, submitError }
}
