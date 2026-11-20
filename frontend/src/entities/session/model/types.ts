export type AuthUser = {
  id: number
  username: string
  email: string
  bio: string | null
  isAdmin: boolean
  favoritesCount: number
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'
