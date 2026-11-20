import { Card } from '@mui/material'
import { useRedirectIfAuthenticated } from '../../entities/session/model/useRedirectIfAuthenticated'
import { LoginForm } from '../../features/auth/ui/LoginForm'

export function LoginPage() {
  useRedirectIfAuthenticated()
  return (
    <div className="page auth-page">
      <Card className="auth-card fade-in-up">
        <LoginForm />
      </Card>
    </div>
  )
}
