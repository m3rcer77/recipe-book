import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { loadJson, saveJson } from '../../../shared/lib/storage'

/** Локальные настройки интерфейса. Данные профиля (имя, email) хранятся на сервере: см. entities/session. */
export type Units = 'metric' | 'cups'
export type UserSettings = { notifications: boolean; units: Units }

type UserContextValue = {
  settings: UserSettings
  updateSettings: (patch: Partial<UserSettings>) => void
}

const SETTINGS_KEY = 'recipe-book:settings'
const defaultSettings: UserSettings = { notifications: true, units: 'metric' }

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => loadJson(SETTINGS_KEY, defaultSettings))

  useEffect(() => saveJson(SETTINGS_KEY, settings), [settings])

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo<UserContextValue>(() => ({ settings, updateSettings }), [settings, updateSettings])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser нужно использовать внутри UserProvider')
  return ctx
}
