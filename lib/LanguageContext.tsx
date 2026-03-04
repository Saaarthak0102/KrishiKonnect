'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language } from './translations'

interface LanguageContextType {
  lang: Language
  changeLang: (newLang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('hi')
  const [isInitialized, setIsInitialized] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language
    if (savedLang === 'hi' || savedLang === 'en') {
      setLang(savedLang)
    }
    setIsInitialized(true)
  }, [])

  const changeLang = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('app_language', newLang)
  }

  // Prevent hydration mismatch by not rendering until initialized
  if (!isInitialized) {
    return null
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
