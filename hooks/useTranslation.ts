'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { translations, Language } from '@/lib/translations'

export function useTranslation() {
  const { lang } = useLanguage()
  
  const t = (key: string): string => {
    const translation = translations[lang] as Record<string, any>
    return translation?.[key] || key
  }

  return { t, lang }
}
