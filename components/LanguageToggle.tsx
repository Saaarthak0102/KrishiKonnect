'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { useEffect, useState } from 'react'

export default function LanguageToggle() {
  const { lang, changeLang } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLanguage = () => {
    const newLang = lang === 'hi' ? 'en' : 'hi'
    changeLang(newLang)
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', newLang)
    }
  }

  // Avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 bg-krishi-primary text-white rounded-lg font-semibold text-sm hover:scale-105 transition-transform"
      aria-label="Toggle language"
    >
      {lang === 'hi' ? 'EN' : 'हिंदी'}
    </button>
  )
}
