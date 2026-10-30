import { ALL } from '../../../shared/config/constants'
import type { All } from '../../../shared/config/constants'

export const CATEGORIES = ['Завтраки', 'Обеды', 'Ужины', 'Десерты'] as const
export type Category = (typeof CATEGORIES)[number]

/** Значение фильтра по категории: конкретная категория или «Все». */
export type CategoryFilter = Category | All
export const CATEGORY_FILTER_OPTIONS: CategoryFilter[] = [ALL, ...CATEGORIES]
