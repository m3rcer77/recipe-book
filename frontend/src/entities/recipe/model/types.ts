import type { Category } from '../../category/model/categories'

export const DIFFICULTIES = ['Легко', 'Средне', 'Сложно'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export type IngredientItem = {
  name: string
  /** Например: «180 г», «2 зубчика», «по вкусу» */
  quantity: string
}

export type Recipe = {
  id: number
  title: string
  description: string
  emoji: string
  category: Category
  /** Время приготовления в минутах */
  cookingTime: number
  difficulty: Difficulty
  calories: number
  ingredients: IngredientItem[]
  steps: string[]
}

/** Данные для создания и редактирования рецепта (без id). */
export type RecipeInput = Omit<Recipe, 'id'>
