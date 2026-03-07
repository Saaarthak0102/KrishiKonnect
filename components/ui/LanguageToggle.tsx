'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const baseButtonClasses =
    'relative z-10 flex-1 flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-300 hover:duration-200 hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] active:scale-[0.96] active:duration-100'

  return (
    <div
      className="relative inline-flex items-center justify-center rounded-xl border border-krishi-border bg-white/70 backdrop-blur-sm p-1 shadow-sm overflow-hidden"
      role="group"
      aria-label="Language selector"
    >
      {/* Sliding Active Pill */}
      <div
        className="absolute inset-y-1 w-[calc(50%-6px)] bg-krishi-primary rounded-lg"
        style={{
          left: 'calc(0.5rem)',
          transform: language === 'hi' ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`${baseButtonClasses} ${
          language === 'en' ? 'text-white' : 'text-krishi-text hover:bg-krishi-primary/10'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`${baseButtonClasses} ${
          language === 'hi' ? 'text-white' : 'text-krishi-text hover:bg-krishi-primary/10'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिंदी
      </button>
    </div>
  )
}
