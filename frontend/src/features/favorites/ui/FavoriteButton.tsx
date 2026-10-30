import { Button, IconButton } from '@mui/material'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import { useToast } from '../../../shared/ui/ToastProvider'
import { useFavorites } from '../model/FavoritesContext'

type Props = {
  recipeId: number
  /** icon — компактная кнопка для карточки, button — с подписью для страницы рецепта */
  variant?: 'icon' | 'button'
}

export function FavoriteButton({ recipeId, variant = 'icon' }: Props) {
  const { isFavorite, toggle } = useFavorites()
  const toast = useToast()
  const active = isFavorite(recipeId)

  const handleClick = () => {
    toggle(recipeId)
    toast(active ? 'Удалено из избранного' : 'Добавлено в избранное', 'info')
  }

  const icon = active ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />
  const className = active ? 'fav-btn active' : 'fav-btn'

  if (variant === 'button') {
    return (
      <Button
        variant={active ? 'outlined' : 'contained'}
        startIcon={icon}
        onClick={handleClick}
        className={className}
        aria-pressed={active}
      >
        {active ? 'В избранном' : 'Сохранить в избранное'}
      </Button>
    )
  }

  return (
    <IconButton
      size="small"
      onClick={handleClick}
      className={className}
      aria-pressed={active}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {icon}
    </IconButton>
  )
}
