import { NavLink, Outlet } from 'react-router-dom'
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/recipes', label: 'Рецепты' },
  { to: '/favorites', label: 'Избранное', icon: <FavoriteBorderRoundedIcon fontSize="small" /> },
]

export function Layout() {
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
      <footer className="footer"><Container maxWidth="lg">Книга рецептов · Лабораторная работа №1</Container></footer>
    </>
  )
}
