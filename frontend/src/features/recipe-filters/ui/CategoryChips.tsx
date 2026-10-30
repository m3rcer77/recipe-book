import { Chip } from '@mui/material'
import { CATEGORY_FILTER_OPTIONS } from '../../../entities/category/model/categories'
import type { CategoryFilter } from '../../../entities/category/model/categories'

type Props = { value: CategoryFilter; onChange: (value: CategoryFilter) => void }

export function CategoryChips({ value, onChange }: Props) {
  return (
    <div className="category-row" role="group" aria-label="Категории">
      {CATEGORY_FILTER_OPTIONS.map((category) => (
        <Chip
          key={category}
          label={category}
          onClick={() => onChange(category)}
          className={value === category ? 'category-active' : ''}
          aria-pressed={value === category}
        />
      ))}
    </div>
  )
}
