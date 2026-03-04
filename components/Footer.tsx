'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function Footer() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <footer className="bg-white border-t-2 border-krishi-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-krishi-heading mb-2">
              KrishiKonnect 🌾
            </h3>
            <p className="text-krishi-text/80">{t.footerTagline}</p>
          </div>

          <div>
            <h4 className="font-semibold text-krishi-heading mb-3">{t.quickLinks}</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/home" className="text-krishi-text/80 hover:text-krishi-primary transition-colors">
                {t.home}
              </Link>
              <Link href="/crop-library" className="text-krishi-text/80 hover:text-krishi-primary transition-colors">
                {t.cropLibrary}
              </Link>
              <Link href="/mandi" className="text-krishi-text/80 hover:text-krishi-primary transition-colors">
                {t.mandiPrices}
              </Link>
              <Link href="/community" className="text-krishi-text/80 hover:text-krishi-primary transition-colors">
                {t.community}
              </Link>
              <Link href="/transport" className="text-krishi-text/80 hover:text-krishi-primary transition-colors">
                {t.transport}
              </Link>
              <Link href="/ai-advisor" className="text-krishi-text/80 hover:text-krishi-primary transition-colors">
                {t.aiAdvisor}
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <p className="text-sm text-krishi-text/60">{t.allRightsReserved}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
