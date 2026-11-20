/**
 * Хранение токенов на клиенте.
 *  - access-токен живёт только в памяти (пропадает при перезагрузке страницы, живёт 15 минут);
 *  - refresh-токен лежит в localStorage, чтобы вход сохранялся после перезагрузки.
 * Компромисс: localStorage доступен скриптам страницы, поэтому важно не допускать XSS
 * (React экранирует вывод, сторонних скриптов в приложении нет).
 */
const REFRESH_KEY = 'recipe-book:refresh-token'

let accessToken: string | null = null

export type Tokens = { accessToken: string; refreshToken: string }

export const tokenStorage = {
  getAccess: (): string | null => accessToken,

  getRefresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY)
    } catch {
      return null
    }
  },

  setTokens(tokens: Tokens): void {
    accessToken = tokens.accessToken
    try {
      localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
    } catch {
      /* хранилище недоступно: вход будет действовать до перезагрузки страницы */
    }
  },

  /** Полная очистка клиентской сессии (выход). */
  clear(): void {
    accessToken = null
    try {
      localStorage.removeItem(REFRESH_KEY)
    } catch {
      /* ничего не делаем */
    }
  },
}
