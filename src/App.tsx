import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Recipes } from './pages/Recipes'
import { RecipeDetails } from './pages/RecipeDetails'
import { Favorites } from './pages/Favorites'
import { Profile } from './pages/Profile'

export default function App() {
  return <BrowserRouter><Routes><Route element={<Layout />}><Route path="/" element={<Home />} /><Route path="/recipes" element={<Recipes />} /><Route path="/recipes/:id" element={<RecipeDetails />} /><Route path="/favorites" element={<Favorites />} /><Route path="/profile" element={<Profile />} /></Route></Routes></BrowserRouter>
}
