import { createTheme } from '@mui/material'

export const theme = createTheme({
  palette: { primary: { main: '#c85b32' }, secondary: { main: '#6d7d50' }, background: { default: '#fffaf5' } },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h4: { fontWeight: 750 },
  },
  shape: { borderRadius: 16 },
})
