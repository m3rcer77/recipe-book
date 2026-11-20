import { Card } from '@mui/material'
import { useRedirectIfAuthenticated } from '../../entities/session/model/useRedirectIfAuthenticated'
import { RegisterForm } from '../../features/auth/ui/RegisterForm'

export function RegisterPage() {
  useRedirectIfAuthenticated()
  return (
    <div className="page auth-page">
      <Card className="auth-card fade-in-up">
        <RegisterForm />
      </Card>
    </div>
  )
}
