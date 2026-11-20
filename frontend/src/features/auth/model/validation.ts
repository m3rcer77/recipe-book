/** Правила совпадают с проверками на backend (schemas/auth.py), поэтому ошибки находятся до отправки запроса. */
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export type LoginValues = { email: string; password: string }
export type RegisterValues = { username: string; email: string; password: string; confirmPassword: string }

type Errors<T> = Partial<Record<keyof T, string>>

export function validateEmail(email: string): string | undefined {
  const value = email.trim()
  if (!value) return 'Введите email'
  if (value.length > 254 || !EMAIL_PATTERN.test(value)) return 'Введите корректный email, например name@example.com'
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Введите пароль'
  if (password.length < 8) return 'Пароль слишком короткий (минимум 8 символов)'
  if (password.length > 128) return 'Пароль слишком длинный (максимум 128 символов)'
  const hasLetter = /\p{L}/u.test(password)
  const hasDigit = /\d/.test(password)
  if (!hasLetter || !hasDigit) return 'Пароль должен содержать буквы и цифры'
  return undefined
}

export function validateLogin(values: LoginValues): Errors<LoginValues> {
  const errors: Errors<LoginValues> = {}
  const email = validateEmail(values.email)
  if (email) errors.email = email
  if (!values.password) errors.password = 'Введите пароль'
  return errors
}

export function validateRegister(values: RegisterValues): Errors<RegisterValues> {
  const errors: Errors<RegisterValues> = {}
  const username = values.username.trim()
  if (!username) errors.username = 'Введите имя'
  else if (username.length < 2) errors.username = 'Имя слишком короткое (минимум 2 символа)'
  else if (username.length > 30) errors.username = 'Имя слишком длинное (максимум 30 символов)'

  const email = validateEmail(values.email)
  if (email) errors.email = email

  const password = validatePassword(values.password)
  if (password) errors.password = password

  if (!values.confirmPassword) errors.confirmPassword = 'Повторите пароль'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Пароли не совпадают'
  return errors
}
