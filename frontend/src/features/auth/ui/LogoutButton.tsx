import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { useAuth } from '../../../entities/session/model/AuthContext'
import { useToast } from '../../../shared/ui/ToastProvider'

export function LogoutButton({ variant = 'text' }: { variant?: 'text' | 'outlined' }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleClick = async () => {
    navigate('/') // сначала уходим со страницы, иначе защищённая страница перебросит на вход
    await logout()
    toast('Вы вышли из аккаунта', 'info')
  }

  return (
    <Button variant={variant} startIcon={<LogoutRoundedIcon />} onClick={handleClick} className="logout-button">
      Выйти
    </Button>
  )
}
