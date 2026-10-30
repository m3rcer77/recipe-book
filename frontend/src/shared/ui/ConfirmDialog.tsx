import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { SlideUpTransition } from './transitions'

type Props = {
  open: boolean
  title: string
  text: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Подтвердить', loading = false, onConfirm, onClose }: Props) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} slots={{ transition: SlideUpTransition }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Отмена</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? 'Удаление…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
