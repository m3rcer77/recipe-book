import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../entities/session/model/AuthContext'

/** Приватные страницы: без входа отправляет на /login и запоминает, куда вернуть после входа. */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="page">
        <div className="state-box" role="status" aria-live="polite">
          <CircularProgress />
          <Typography className="muted">Проверяем вход…</Typography>
        </div>
      </div>
    )
  }
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
