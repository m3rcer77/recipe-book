import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { SlideUpTransition } from '../../../shared/ui/transitions'
import type { UserProfile } from '../../../entities/user/model/UserContext'
import { validateProfile } from '../model/validation'

type Props = {
  open: boolean
  initial: UserProfile
  onClose: () => void
  onSave: (profile: UserProfile) => void
}

export function ProfileEditDialog({ open, initial, onClose, onSave }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slots={{ transition: SlideUpTransition }}>
      <ProfileForm initial={initial} onClose={onClose} onSave={onSave} />
    </Dialog>
  )
}

function ProfileForm({ initial, onClose, onSave }: Omit<Props, 'open'>) {
  const [values, setValues] = useState<UserProfile>(initial)
  const [touched, setTouched] = useState<{ name?: boolean; bio?: boolean }>({})
  const [submitted, setSubmitted] = useState(false)

  const errors = validateProfile(values)
  const show = (key: 'name' | 'bio') => (submitted || touched[key] ? errors[key] : undefined)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (errors.name || errors.bio) return
    onSave({ name: values.name.trim(), bio: values.bio.trim() })
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="dialog-form">
      <DialogTitle>Редактировать профиль</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Имя"
          required
          fullWidth
          margin="dense"
          value={values.name}
          onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          error={Boolean(show('name'))}
          helperText={show('name') ?? ' '}
        />
        <TextField
          label="О себе"
          fullWidth
          multiline
          minRows={2}
          margin="dense"
          value={values.bio}
          onChange={(e) => setValues((prev) => ({ ...prev, bio: e.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, bio: true }))}
          error={Boolean(show('bio'))}
          helperText={show('bio') ?? `${values.bio.trim().length}/100`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button type="submit" variant="contained">Сохранить</Button>
      </DialogActions>
    </form>
  )
}
