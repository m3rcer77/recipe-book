import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './layout/Layout'
import { HomePage } from '../pages/home/HomePage'
import { RecipesPage } from '../pages/recipes/RecipesPage'
import { RecipeDetailsPage } from '../pages/recipe-details/RecipeDetailsPage'
import { FavoritesPage } from '../pages/favorites/FavoritesPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
