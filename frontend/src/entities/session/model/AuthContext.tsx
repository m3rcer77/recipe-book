import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { refreshSession, setSessionExpiredHandler } from '../../../shared/api/authorizedRequest'
import { tokenStorage } from '../../../shared/api/tokenStorage'
import { authApi } from '../api/authApi'
import type { AuthResult } from '../api/authApi'
import type { AuthStatus, AuthUser } from './types'

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (input: { username: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (patch: { username?: string; bio?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Хранит текущую сессию: кто вошёл, и восстанавливает её при открытии приложения. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const startSession = useCallback((result: AuthResult) => {
    tokenStorage.setTokens(result.tokens)
    setUser(result.user)
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    let cancelled = false
    // Если во время любого запроса сессию продлить не удалось — выходим из приложения на клиенте
    setSessionExpiredHandler(() => {
      setUser(null)
      setStatus('anonymous')
    })

    async function restore() {
      if (!tokenStorage.getRefresh()) {
        setStatus('anonymous')
        return
      }
      try {
        // После перезагрузки страницы access-токена в памяти нет: получаем его по refresh-токену
        const refreshed = await refreshSession()
        if (!refreshed) throw new Error('Сессия недействительна')
        const me = await authApi.me()
        if (!cancelled) {
          setUser(me)
          setStatus('authenticated')
        }
      } catch {
        if (!cancelled) setStatus('anonymous')
      }
    }
    void restore()

    return () => {
      cancelled = true
      setSessionExpiredHandler(null)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => startSession(await authApi.login(email, password)),
    [startSession],
  )

  const register = useCallback(
    async (input: { username: string; email: string; password: string }) => startSession(await authApi.register(input)),
    [startSession],
  )

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefresh()
    // Клиентское состояние очищаем сразу, независимо от ответа сервера
    tokenStorage.clear()
    setUser(null)
    setStatus('anonymous')
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        /* сервер недоступен: refresh-токен всё равно удалён у клиента */
      }
    }
  }, [])

  const updateProfile = useCallback(
    async (patch: { username?: string; bio?: string }) => {
      if (!user) throw new Error('Требуется вход в аккаунт')
      setUser(await authApi.updateProfile(user.id, patch))
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, updateProfile }),
    [status, user, login, register, logout, updateProfile],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth нужно использовать внутри AuthProvider')
  return ctx
}
