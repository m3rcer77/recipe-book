import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../../shared/ui/ToastProvider'
import { useAuth } from './AuthContext'

/**
 * Для действий, доступных только после входа: если пользователь вошёл — выполняет действие,
 * иначе отправляет на страницу входа и после входа возвращает обратно.
 */
export function useRequireAuth() {
  const { status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  return useCallback(
    (action: () => void) => {
      if (status === 'authenticated') {
        action()
        return
      }
      toast('Войдите в аккаунт, чтобы выполнить это действие', 'info')
      navigate('/login', { state: { from: location } })
    },
    [status, navigate, location, toast],
  )
}
