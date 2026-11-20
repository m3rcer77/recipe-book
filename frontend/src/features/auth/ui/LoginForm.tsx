import { Link, useLocation } from 'react-router-dom'
import { Alert, Button, Collapse, TextField, Typography } from '@mui/material'
import { useAuth } from '../../../entities/session/model/AuthContext'
import { useToast } from '../../../shared/ui/ToastProvider'
import { useSimpleForm } from '../../../shared/lib/useSimpleForm'
import { validateLogin } from '../model/validation'
import type { LoginValues } from '../model/validation'

export function LoginForm() {
  const { login } = useAuth()
  const toast = useToast()
  const location = useLocation()

  // После успешного входа страница сама перенаправит пользователя (useRedirectIfAuthenticated)
  const form = useSimpleForm<LoginValues>({ email: '', password: '' }, validateLogin, async (values) => {
    await login(values.email.trim(), values.password)
    toast('С возвращением!')
  })

  return (
    <form noValidate onSubmit={form.handleSubmit} className="auth-form">
      <Typography variant="h4">Вход</Typography>
      <Typography className="muted">Войдите, чтобы сохранять рецепты и добавлять свои</Typography>

      <Collapse in={Boolean(form.submitError)}>
        <Alert severity="error">{form.submitError}</Alert>
      </Collapse>

      <TextField label="Email" type="email" autoComplete="email" fullWidth autoFocus {...form.fieldProps('email')} />
      <TextField label="Пароль" type="password" autoComplete="current-password" fullWidth {...form.fieldProps('password')} />

      <Button type="submit" variant="contained" size="large" disabled={form.submitting} className="auth-submit">
        {form.submitting ? 'Входим…' : 'Войти'}
      </Button>
      <Typography className="muted auth-switch">
        Нет аккаунта? <Link to="/register" state={location.state}>Зарегистрироваться</Link>
      </Typography>
    </form>
  )
}
