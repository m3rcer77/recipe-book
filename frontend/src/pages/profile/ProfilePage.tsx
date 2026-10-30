import { useState } from 'react'
import { Avatar, Box, Button, Card, CardContent, Divider, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded'
import { useToast } from '../../shared/ui/ToastProvider'
import { demoApi } from '../../entities/recipe/api/demoApi'
import { useRecipes } from '../../entities/recipe/model/RecipesContext'
import { useUser } from '../../entities/user/model/UserContext'
import type { Units } from '../../entities/user/model/UserContext'
import { useFavorites } from '../../features/favorites/model/FavoritesContext'
import { ProfileEditDialog } from '../../features/profile-edit/ui/ProfileEditDialog'

export function ProfilePage() {
  const { profile, settings, updateProfile, updateSettings } = useUser()
  const { recipes, reload } = useRecipes()
  const { ids } = useFavorites()
  const toast = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [simulateFailure, setSimulateFailure] = useState(demoApi.isFailMode())

  const savedCount = recipes.filter((r) => ids.includes(r.id)).length

  const handleSave = (next: { name: string; bio: string }) => {
    updateProfile(next)
    setEditOpen(false)
    toast('Профиль обновлён')
  }

  const handleNotifications = (enabled: boolean) => {
    updateSettings({ notifications: enabled })
    toast(enabled ? 'Уведомления включены' : 'Уведомления отключены', 'info')
  }

  const handleUnits = (_: unknown, value: Units | null) => {
    if (value) updateSettings({ units: value })
  }

  /** Только для демонстрации: показывает, как интерфейс реагирует на сбой сети. */
  const handleFailure = (enabled: boolean) => {
    setSimulateFailure(enabled)
    demoApi.setFailMode(enabled)
    reload()
    toast(enabled ? 'Сбой сети включён: откройте «Рецепты», чтобы увидеть ошибку' : 'Сбой сети отключён', 'info')
  }

  return (
    <div className="page profile-page">
      <Box className="profile-top">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar className="profile-avatar">{profile.name.trim().charAt(0).toUpperCase() || '?'}</Avatar>
          <div>
            <Typography variant="h2">{profile.name}</Typography>
            <Typography className="muted">{profile.bio || 'Расскажите о себе'}</Typography>
          </div>
        </Stack>
        <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setEditOpen(true)}>Редактировать</Button>
      </Box>

      <div className="stats-grid">
        <Card className="fade-in-up"><CardContent><BookmarkBorderRoundedIcon /><Typography variant="h4">{savedCount}</Typography><Typography className="muted">сохранённых рецептов</Typography></CardContent></Card>
        <Card className="fade-in-up" style={{ animationDelay: '80ms' }}><CardContent><RestaurantRoundedIcon /><Typography variant="h4">8</Typography><Typography className="muted">приготовлено</Typography></CardContent></Card>
        <Card className="fade-in-up" style={{ animationDelay: '160ms' }}><CardContent><Typography variant="h4">4.9</Typography><Typography className="muted">средняя оценка</Typography></CardContent></Card>
      </div>

      <Card className="settings-card">
        <CardContent>
          <Typography variant="h5">Настройки</Typography>
          <Divider />
          <Box className="setting-row">
            <div>
              <Typography fontWeight={700}>Уведомления о новых рецептах</Typography>
              <Typography className="muted">Получать подборки раз в неделю</Typography>
            </div>
            <Switch checked={settings.notifications} onChange={(e) => handleNotifications(e.target.checked)} slotProps={{ input: { 'aria-label': 'Уведомления о новых рецептах' } }} />
          </Box>
          <Divider />
          <Box className="setting-row">
            <div>
              <Typography fontWeight={700}>Единицы измерения</Typography>
              <Typography className="muted">{settings.units === 'metric' ? 'Граммы и миллилитры' : 'Чашки и ложки'}</Typography>
            </div>
            <ToggleButtonGroup exclusive size="small" value={settings.units} onChange={handleUnits}>
              <ToggleButton value="metric">г / мл</ToggleButton>
              <ToggleButton value="cups">чашки</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Divider />
          <Box className="setting-row">
            <div>
              <Typography fontWeight={700}>Демо: имитировать сбой сети</Typography>
              <Typography className="muted">Для проверки состояния ошибки и кнопки «Повторить»</Typography>
            </div>
            <Switch checked={simulateFailure} onChange={(e) => handleFailure(e.target.checked)} slotProps={{ input: { 'aria-label': 'Имитировать сбой сети' } }} />
          </Box>
        </CardContent>
      </Card>

      <ProfileEditDialog open={editOpen} initial={profile} onClose={() => setEditOpen(false)} onSave={handleSave} />
    </div>
  )
}
