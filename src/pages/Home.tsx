import { useMemo, useState } from 'react'
import { Box, Button, Chip, InputAdornment, TextField, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link } from 'react-router-dom'
import { categories, recipes } from '../data'
import { RecipeCard } from '../components/RecipeCard'

export function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const filtered = useMemo(() => recipes.filter(r => (category === 'Все' || r.category === category) && r.title.toLowerCase().includes(query.toLowerCase())), [query, category])
  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <Chip label="Новая коллекция рецептов" className="hero-chip" />
          <Typography variant="h1">Готовь вкусно.<br /><span>Живи проще.</span></Typography>
          <Typography className="hero-subtitle">Собрали понятные рецепты на каждый день — от быстрого завтрака до уютного ужина.</Typography>
          <TextField value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти рецепт..." className="search-field" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }} />
          <Box className="hero-actions"><Button component={Link} to="/recipes" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>Смотреть рецепты</Button><Button component={Link} to="/favorites" variant="text">Мои сохранённые</Button></Box>
        </div>
        <div className="hero-art"><div className="hero-plate">🥗</div><div className="floating-card top">⭐ 4.9<br /><small>рейтинг рецептов</small></div><div className="floating-card bottom">⏱ 20 мин<br /><small>среднее время</small></div></div>
      </section>
      <section className="section-block">
        <Box className="section-heading"><div><Typography variant="h4">Категории</Typography><Typography className="muted">Выбери настроение на сегодня</Typography></div></Box>
        <div className="category-row">{categories.map(c => <Chip key={c} label={c} onClick={() => setCategory(c)} className={category === c ? 'category-active' : ''} />)}</div>
      </section>
      <section className="section-block">
        <Box className="section-heading"><div><Typography variant="h4">Популярные рецепты</Typography><Typography className="muted">Простые блюда, которые любят готовить дома</Typography></div><Button component={Link} to="/recipes">Все рецепты →</Button></Box>
        <div className="recipe-grid">{filtered.slice(0, 4).map(r => <RecipeCard key={r.id} recipe={r} />)}</div>
      </section>
    </div>
  )
}
