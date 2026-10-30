import { delay } from '../../../shared/lib/delay'
import { initialRecipes } from './demoData'
import type { Recipe, RecipeInput } from '../model/types'

/**
 * Демонстрационный «сервер» в памяти браузера.
 * Методы асинхронные и с задержкой, как настоящие HTTP-запросы, поэтому интерфейс
 * проходит через состояния загрузки и ошибки. В лабораторной №5 этот модуль
 * заменяется запросами к FastAPI с теми же сигнатурами.
 */
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

let db: Recipe[] = clone(initialRecipes)
let nextId = Math.max(...db.map((r) => r.id)) + 1
let failMode = false

const NETWORK_ERROR = 'Не удалось связаться с сервером. Проверьте соединение и повторите попытку.'

async function request(ms: number): Promise<void> {
  await delay(ms)
  if (failMode) throw new Error(NETWORK_ERROR)
}

export const demoApi = {
  /** Включает имитацию сбоя сети — чтобы показать состояние ошибки. */
  setFailMode(value: boolean): void {
    failMode = value
  },
  isFailMode(): boolean {
    return failMode
  },

  async list(): Promise<Recipe[]> {
    await request(700)
    return clone(db)
  },

  async create(input: RecipeInput): Promise<Recipe> {
    await request(500)
    const recipe: Recipe = { ...clone(input), id: nextId++ }
    db = [...db, recipe]
    return clone(recipe)
  },

  async update(id: number, input: RecipeInput): Promise<Recipe> {
    await request(500)
    const exists = db.some((r) => r.id === id)
    if (!exists) throw new Error('Рецепт не найден. Возможно, его уже удалили.')
    const recipe: Recipe = { ...clone(input), id }
    db = db.map((r) => (r.id === id ? recipe : r))
    return clone(recipe)
  },

  async remove(id: number): Promise<void> {
    await request(400)
    db = db.filter((r) => r.id !== id)
  },
}
