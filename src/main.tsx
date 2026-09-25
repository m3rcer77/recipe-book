import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'
import './styles.css'

const theme = createTheme({
  palette: { primary: { main: '#c85b32' }, secondary: { main: '#6d7d50' }, background: { default: '#fffaf5' } },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', h1: { fontWeight: 800 }, h2: { fontWeight: 800 }, h4: { fontWeight: 750 } },
  shape: { borderRadius: 16 },
})

createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></StrictMode>)
