import { Alert, Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { SlideUpTransition } from '../../../shared/ui/transitions'
import { useSimpleForm } from '../../../shared/lib/useSimpleForm'
import { validateProfile } from '../model/validation'
import type { ProfileValues } from '../model/validation'

type Props = {
  open: boolean
  initial: ProfileValues
  onClose: () => void
  /** Должна завершиться успешно или бросить ошибку — она будет показана в форме */
  onSave: (values: ProfileValues) => Promise<void>
}

export function ProfileEditDialog({ open, initial, onClose, onSave }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slots={{ transition: SlideUpTransition }}>
      {/* Форма размонтируется при закрытии, поэтому каждый раз открывается с актуальными данными */}
      <ProfileForm initial={initial} onClose={onClose} onSave={onSave} />
    </Dialog>
  )
}

function ProfileForm({ initial, onClose, onSave }: Omit<Props, 'open'>) {
  const form = useSimpleForm<ProfileValues>(initial, validateProfile, async (values) => {
    await onSave({ username: values.username.trim(), bio: values.bio.trim() })
  })

  return (
    <form noValidate onSubmit={form.handleSubmit} className="dialog-form">
      <DialogTitle>Редактировать профиль</DialogTitle>
      <DialogContent dividers>
        <Collapse in={Boolean(form.submitError)}>
          <Alert severity="error" sx={{ mb: 1 }}>{form.submitError}</Alert>
        </Collapse>
        <TextField label="Имя" required fullWidth margin="dense" {...form.fieldProps('username')} />
        <TextField label="О себе" fullWidth multiline minRows={2} margin="dense" {...form.fieldProps('bio')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={form.submitting}>Отмена</Button>
        <Button type="submit" variant="contained" disabled={form.submitting}>
          {form.submitting ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </DialogActions>
    </form>
  )
}
