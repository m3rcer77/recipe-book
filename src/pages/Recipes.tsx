import { useMemo, useState } from 'react'
import { Box, Chip, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { categories, recipes } from '../data'
import { RecipeCard } from '../components/RecipeCard'

export function Recipes() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const filtered = useMemo(() => recipes.filter(r => (category === 'Все' || r.category === category) && `${r.title} ${r.description}`.toLowerCase().includes(query.toLowerCase())), [query, category])
  return <div className="page"><Box className="page-header"><div><Typography variant="h2">Все рецепты</Typography><Typography className="muted">Найди блюдо по вкусу и настроению</Typography></div><TextField size="small" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск" InputProps={{ startAdornment: <SearchRoundedIcon className="field-icon" /> }} /></Box><Box className="filters"><div className="category-row">{categories.map(c => <Chip key={c} label={c} onClick={() => setCategory(c)} className={category === c ? 'category-active' : ''} />)}</div><FormControl size="small" sx={{ minWidth: 170 }}><InputLabel>Сложность</InputLabel><Select label="Сложность" defaultValue="Все"><MenuItem value="Все">Все уровни</MenuItem><MenuItem value="Легко">Легко</MenuItem><MenuItem value="Средне">Средне</MenuItem></Select></FormControl></Box><div className="recipe-grid">{filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}</div></div>
}
