import type { UserProfile } from '../../../entities/user/model/UserContext'

export type ProfileErrors = { name?: string; bio?: string }

export function validateProfile(values: UserProfile): ProfileErrors {
  const errors: ProfileErrors = {}
  const name = values.name.trim()
  if (!name) errors.name = 'Введите имя'
  else if (name.length < 2) errors.name = 'Имя слишком короткое (минимум 2 символа)'
  else if (name.length > 30) errors.name = 'Имя слишком длинное (максимум 30 символов)'
  if (values.bio.trim().length > 100) errors.bio = 'Не более 100 символов'
  return errors
}
