/** Адрес backend. Меняется через переменную VITE_API_URL (файл .env). */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/** Ошибка запроса к API. status = 0 означает, что сервер недоступен. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Access-токен для заголовка Authorization */
  token?: string | null
}

/** Текст ошибки из ответа FastAPI: {"detail": "..."} или список ошибок валидации (422). */
function extractMessage(data: unknown, status: number): string {
  if (data !== null && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return 'Проверьте правильность введённых данных.'
  }
  return `Ошибка сервера (код ${status}). Попробуйте позже.`
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Не удалось связаться с сервером. Проверьте, что backend запущен.')
  }

  if (response.status === 204) return undefined as T
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, extractMessage(data, response.status))
  return data as T
}
