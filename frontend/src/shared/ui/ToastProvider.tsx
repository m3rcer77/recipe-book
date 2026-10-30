import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'

type Severity = 'success' | 'info' | 'error'
type ShowToast = (message: string, severity?: Severity) => void

const ToastContext = createContext<ShowToast>(() => {})

/** Короткие уведомления о результате действия пользователя (Snackbar снизу). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; severity: Severity; key: number }>({
    message: '',
    severity: 'success',
    key: 0,
  })

  const show = useCallback<ShowToast>((message, severity = 'success') => {
    setToast({ message, severity, key: Date.now() })
    setOpen(true)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Snackbar
        key={toast.key}
        open={open}
        autoHideDuration={3000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setOpen(false)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setOpen(false)}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast(): ShowToast {
  return useContext(ToastContext)
}
