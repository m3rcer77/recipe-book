import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './layout/Layout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { HomePage } from '../pages/home/HomePage'
import { RecipesPage } from '../pages/recipes/RecipesPage'
import { RecipeDetailsPage } from '../pages/recipe-details/RecipeDetailsPage'
import { FavoritesPage } from '../pages/favorites/FavoritesPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { LoginPage } from '../pages/login/LoginPage'
import { RegisterPage } from '../pages/register/RegisterPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Публичные страницы */}
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Приватные страницы: нужен вход */}
          <Route element={<ProtectedRoute />}>
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
