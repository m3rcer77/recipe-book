import { NavLink, Outlet } from 'react-router-dom'
import { AppBar, Badge, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { useRecipes } from '../../entities/recipe/model/RecipesContext'
import { useFavorites } from '../../features/favorites/model/FavoritesContext'

export function Layout() {
  const { recipes } = useRecipes()
  const { ids } = useFavorites()
  const favoritesCount = recipes.filter((r) => ids.includes(r.id)).length

  const navItems = [
    { to: '/', label: 'Главная', icon: undefined },
    { to: '/recipes', label: 'Рецепты', icon: undefined },
    {
      to: '/favorites',
      label: 'Избранное',
      icon: (
        <Badge badgeContent={favoritesCount} color="primary" max={99}>
          <FavoriteBorderRoundedIcon fontSize="small" />
        </Badge>
      ),
    },
  ]

  return (
    <>
      <AppBar position="sticky" elevation={0} className="topbar">
        <Toolbar className="toolbar">
          <NavLink to="/" className="brand">
            <span className="brand-icon"><MenuBookRoundedIcon /></span>
            <Typography variant="h6" className="brand-title">Вкусно</Typography>
          </NavLink>
          <Box className="nav-links">
            {navItems.map((item) => (
              <Button key={item.to} component={NavLink} to={item.to} startIcon={item.icon} className="nav-button">
                {item.label}
              </Button>
            ))}
          </Box>
          <Button component={NavLink} to="/profile" className="profile-button" startIcon={<PersonOutlineRoundedIcon />}>
            Профиль
          </Button>
        </Toolbar>
      </AppBar>
      <main><Container maxWidth="lg"><Outlet /></Container></main>
      <footer className="footer"><Container maxWidth="lg">Книга рецептов · Лабораторная работа №3</Container></footer>
    </>
  )
}
