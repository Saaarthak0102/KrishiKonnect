'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type AppLanguage = 'en' | 'hi'

interface LanguageContextType {
  language: AppLanguage
  lang: AppLanguage
  setLanguage: (newLanguage: AppLanguage) => void
  changeLang: (newLanguage: AppLanguage) => void
  toggleLanguage: () => void
}

const STORAGE_KEY = 'krishi_lang'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function normalizeLanguage(value: string | null | undefined): AppLanguage | null {
  if (value === 'en' || value === 'hi') {
    return value
  }
  return null
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const savedLanguage =
      normalizeLanguage(localStorage.getItem(STORAGE_KEY)) ||
      normalizeLanguage(localStorage.getItem('app_language')) ||
      normalizeLanguage(localStorage.getItem('selectedLanguage'))

    if (savedLanguage) {
      setLanguageState(savedLanguage)
    }

    setIsInitialized(true)
  }, [])

  const setLanguage = (newLanguage: AppLanguage) => {
    setLanguageState(newLanguage)
    localStorage.setItem(STORAGE_KEY, newLanguage)
  }

  const changeLang = (newLanguage: AppLanguage) => {
    setLanguage(newLanguage)
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en')
  }

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      lang: language,
      setLanguage,
      changeLang,
      toggleLanguage,
    }),
    [language]
  )

  // Prevent hydration mismatch by waiting for client-side language restoration.
  if (!isInitialized) {
    return null
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
