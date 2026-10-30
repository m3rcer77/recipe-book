import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { loadJson, saveJson } from '../../../shared/lib/storage'

export type UserProfile = { name: string; bio: string }
export type Units = 'metric' | 'cups'
export type UserSettings = { notifications: boolean; units: Units }

type UserContextValue = {
  profile: UserProfile
  settings: UserSettings
  updateProfile: (profile: UserProfile) => void
  updateSettings: (patch: Partial<UserSettings>) => void
}

const PROFILE_KEY = 'recipe-book:profile'
const SETTINGS_KEY = 'recipe-book:settings'

const defaultProfile: UserProfile = { name: 'Иван', bio: 'Люблю простые домашние блюда' }
const defaultSettings: UserSettings = { notifications: true, units: 'metric' }

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => loadJson(PROFILE_KEY, defaultProfile))
  const [settings, setSettings] = useState<UserSettings>(() => loadJson(SETTINGS_KEY, defaultSettings))

  useEffect(() => saveJson(PROFILE_KEY, profile), [profile])
  useEffect(() => saveJson(SETTINGS_KEY, settings), [settings])

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const value = useMemo<UserContextValue>(
    () => ({ profile, settings, updateProfile: setProfile, updateSettings }),
    [profile, settings, updateSettings],
  )
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser нужно использовать внутри UserProvider')
  return ctx
}
