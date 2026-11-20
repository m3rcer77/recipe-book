import { Link, useLocation } from 'react-router-dom'
import { Alert, Button, Collapse, TextField, Typography } from '@mui/material'
import { useAuth } from '../../../entities/session/model/AuthContext'
import { useToast } from '../../../shared/ui/ToastProvider'
import { useSimpleForm } from '../../../shared/lib/useSimpleForm'
import { validateRegister } from '../model/validation'
import type { RegisterValues } from '../model/validation'

export function RegisterForm() {
  const { register } = useAuth()
  const toast = useToast()
  const location = useLocation()

  const form = useSimpleForm<RegisterValues>(
    { username: '', email: '', password: '', confirmPassword: '' },
    validateRegister,
    async (values) => {
      await register({ username: values.username.trim(), email: values.email.trim(), password: values.password })
      toast('Аккаунт создан. Добро пожаловать!')
    },
  )

  return (
    <form noValidate onSubmit={form.handleSubmit} className="auth-form">
      <Typography variant="h4">Регистрация</Typography>
      <Typography className="muted">Создайте аккаунт, чтобы вести свою книгу рецептов</Typography>

      <Collapse in={Boolean(form.submitError)}>
        <Alert severity="error">{form.submitError}</Alert>
      </Collapse>

      <TextField label="Имя" autoComplete="nickname" fullWidth autoFocus {...form.fieldProps('username')} />
      <TextField label="Email" type="email" autoComplete="email" fullWidth {...form.fieldProps('email')} />
      <TextField label="Пароль" type="password" autoComplete="new-password" fullWidth {...form.fieldProps('password')} />
      <TextField
        label="Повторите пароль"
        type="password"
        autoComplete="new-password"
        fullWidth
        {...form.fieldProps('confirmPassword')}
      />

      <Button type="submit" variant="contained" size="large" disabled={form.submitting} className="auth-submit">
        {form.submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
      </Button>
      <Typography className="muted auth-switch">
        Уже есть аккаунт? <Link to="/login" state={location.state}>Войти</Link>
      </Typography>
    </form>
  )
}
