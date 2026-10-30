export function getErrorMessage(error: unknown, fallback = 'Что-то пошло не так. Попробуйте ещё раз.'): string {
  return error instanceof Error && error.message ? error.message : fallback
}
