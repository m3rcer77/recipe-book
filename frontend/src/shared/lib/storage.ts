/** Безопасная работа с localStorage: ошибки (приватный режим, переполнение) не ломают приложение. */
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* хранилище недоступно — состояние просто не сохранится */
  }
}
