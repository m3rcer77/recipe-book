import type { ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from '../theme'
import { ToastProvider } from '../../shared/ui/ToastProvider'
import { UserProvider } from '../../entities/user/model/UserContext'
import { RecipesProvider } from '../../entities/recipe/model/RecipesContext'
import { FavoritesProvider } from '../../features/favorites/model/FavoritesContext'

/** Все глобальные провайдеры приложения в одном месте. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <UserProvider>
          <RecipesProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </RecipesProvider>
        </UserProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
