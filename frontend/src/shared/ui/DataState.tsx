import type { ReactNode } from 'react'
import { Alert, Button, CircularProgress, Typography } from '@mui/material'
import type { LoadStatus } from '../lib/types'

type Props = {
  status: LoadStatus
  error?: string | null
  /** true — данные загружены, но показывать нечего */
  isEmpty: boolean
  onRetry?: () => void
  /** Что показывать при загрузке (по умолчанию — спиннер) */
  skeleton?: ReactNode
  emptyIcon?: string
  emptyTitle: string
  emptyText?: string
  emptyAction?: ReactNode
  children: ReactNode
}

/** Единое место для трёх состояний экрана с данными: загрузка, ошибка, нет данных. */
export function DataState({
  status,
  error,
  isEmpty,
  onRetry,
  skeleton,
  emptyIcon = '🍽️',
  emptyTitle,
  emptyText,
  emptyAction,
  children,
}: Props) {
  if (status === 'loading') {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        {skeleton ?? (
          <div className="state-box">
            <CircularProgress />
            <Typography className="muted">Загрузка…</Typography>
          </div>
        )}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert
        severity="error"
        className="state-alert fade-in-up"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Повторить
            </Button>
          ) : undefined
        }
      >
        {error ?? 'Не удалось загрузить данные.'}
      </Alert>
    )
  }

  if (isEmpty) {
    return (
      <div className="state-box fade-in-up">
        <div className="state-icon" aria-hidden="true">{emptyIcon}</div>
        <Typography variant="h5">{emptyTitle}</Typography>
        {emptyText && <Typography className="muted">{emptyText}</Typography>}
        {emptyAction}
      </div>
    )
  }

  return <>{children}</>
}
