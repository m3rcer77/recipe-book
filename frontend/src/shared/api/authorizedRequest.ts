import { ApiError, apiRequest } from './http'
import type { RequestOptions } from './http'
import { tokenStorage } from './tokenStorage'

type TokenPairDto = { access_token: string; refresh_token: string }

let refreshPromise: Promise<boolean> | null = null
let onSessionExpired: (() => void) | null = null

/** AuthProvider регистрирует обработчик: что делать, если сессию не удалось продлить. */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler
}

/**
 * Обновляет access-токен по refresh-токену.
 *  - true  — получена новая пара токенов;
 *  - false — refresh-токена нет или сервер его отклонил (токены очищены, нужен новый вход);
 *  - ошибка — сервер недоступен (токены сохраняются, можно повторить позже).
 * Параллельные вызовы используют один запрос: refresh-токен одноразовый, второй запрос с тем же токеном был бы отклонён.
 */
export function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) return Promise.resolve(false)

  refreshPromise = apiRequest<TokenPairDto>('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken } })
    .then((pair) => {
      tokenStorage.setTokens({ accessToken: pair.access_token, refreshToken: pair.refresh_token })
      return true
    })
    .catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        tokenStorage.clear()
        return false
      }
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

/**
 * Запрос к приватному маршруту: добавляет access-токен и при ответе 401 один раз
 * пытается обновить токен и повторить запрос. Если обновить не удалось — сессия завершается.
 */
export async function authorizedRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await apiRequest<T>(path, { ...options, token: tokenStorage.getAccess() })
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    const refreshed = await refreshSession()
    if (!refreshed) {
      onSessionExpired?.()
      throw error
    }
    return apiRequest<T>(path, { ...options, token: tokenStorage.getAccess() })
  }
}
