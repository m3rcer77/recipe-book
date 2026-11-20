import { apiRequest } from '../../../shared/api/http'
import { authorizedRequest } from '../../../shared/api/authorizedRequest'
import type { Tokens } from '../../../shared/api/tokenStorage'
import type { AuthUser } from '../model/types'

/** Форматы backend (snake_case) */
type UserDto = {
  id: number
  username: string
  email: string
  bio: string | null
  is_admin: boolean
  favorites_count: number
}

type AuthResponseDto = {
  access_token: string
  refresh_token: string
  user: UserDto
}

export type AuthResult = { user: AuthUser; tokens: Tokens }

const toUser = (dto: UserDto): AuthUser => ({
  id: dto.id,
  username: dto.username,
  email: dto.email,
  bio: dto.bio,
  isAdmin: dto.is_admin,
  favoritesCount: dto.favorites_count,
})

const toResult = (dto: AuthResponseDto): AuthResult => ({
  user: toUser(dto.user),
  tokens: { accessToken: dto.access_token, refreshToken: dto.refresh_token },
})

export const authApi = {
  async register(input: { username: string; email: string; password: string }): Promise<AuthResult> {
    return toResult(await apiRequest<AuthResponseDto>('/auth/register', { method: 'POST', body: input }))
  },

  async login(email: string, password: string): Promise<AuthResult> {
    return toResult(await apiRequest<AuthResponseDto>('/auth/login', { method: 'POST', body: { email, password } }))
  },

  /** Текущий пользователь (приватный маршрут). */
  async me(): Promise<AuthUser> {
    return toUser(await authorizedRequest<UserDto>('/auth/me'))
  },

  /** Выход: сервер отзывает refresh-токен текущей сессии. */
  async logout(refreshToken: string): Promise<void> {
    await apiRequest<void>('/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } })
  },

  async updateProfile(userId: number, patch: { username?: string; bio?: string }): Promise<AuthUser> {
    return toUser(await authorizedRequest<UserDto>(`/users/${userId}`, { method: 'PATCH', body: patch }))
  },
}
