export type ProfileValues = { username: string; bio: string }
export type ProfileErrors = Partial<Record<keyof ProfileValues, string>>

export function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {}
  const username = values.username.trim()
  if (!username) errors.username = 'Введите имя'
  else if (username.length < 2) errors.username = 'Имя слишком короткое (минимум 2 символа)'
  else if (username.length > 30) errors.username = 'Имя слишком длинное (максимум 30 символов)'
  if (values.bio.trim().length > 100) errors.bio = 'Не более 100 символов'
  return errors
}
