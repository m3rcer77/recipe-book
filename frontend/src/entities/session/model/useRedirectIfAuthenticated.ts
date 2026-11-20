import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

type FromState = { from?: { pathname: string } } | null

/** Для страниц входа и регистрации: после входа возвращает на страницу, откуда пришёл пользователь. */
export function useRedirectIfAuthenticated() {
  const { status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const target = (location.state as FromState)?.from?.pathname ?? '/'

  useEffect(() => {
    if (status === 'authenticated') navigate(target, { replace: true })
  }, [status, navigate, target])
}
