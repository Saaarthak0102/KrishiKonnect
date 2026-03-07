'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className="inline-flex items-center rounded-xl border border-krishi-border bg-white/70 backdrop-blur-sm p-1 shadow-sm"
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          language === 'en'
            ? 'bg-krishi-primary text-white'
            : 'text-krishi-text hover:bg-krishi-primary/10'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          language === 'hi'
            ? 'bg-krishi-primary text-white'
            : 'text-krishi-text hover:bg-krishi-primary/10'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिंदी
      </button>
    </div>
  )
}
