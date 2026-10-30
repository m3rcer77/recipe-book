import { Link } from 'react-router-dom'
import { Button, Typography } from '@mui/material'

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="state-box fade-in-up">
        <div className="state-icon" aria-hidden="true">🧭</div>
        <Typography variant="h4">Страница не найдена</Typography>
        <Typography className="muted">Проверьте адрес или вернитесь на главную.</Typography>
        <Button component={Link} to="/" variant="contained">На главную</Button>
      </div>
    </div>
  )
}
