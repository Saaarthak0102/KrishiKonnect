'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { usePathname } from 'next/navigation'
import LanguageToggle from '@/components/ui/LanguageToggle'

export default function Navbar() {
  const { lang } = useLanguage()
  const pathname = usePathname()
  const t = translations[lang]

  // Check if we're on the home/landing page
  const isHomePage = pathname === '/' || pathname === '/home'

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-white border-b-2 border-krishi-border shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-krishi-heading">
              KrishiKonnect 🌾
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {isHomePage ? (
              <>
                <a href="#" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.home}
                </a>
                <a href="#features" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {lang === 'hi' ? 'सुविधाएं' : 'Features'}
                </a>
                <a href="#how-it-works" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.howItWorksHeading}
                </a>
                <a href="#ai-advisor" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.aiAdvisor}
                </a>
              </>
            ) : (
              <>
                <Link href="/" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.home}
                </Link>
                <Link href="/crop-library" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.cropLibrary}
                </Link>
                <Link href="/mandi" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.mandiPrices}
                </Link>
                <Link href="/community" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.community}
                </Link>
                <Link href="/transport" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.transport}
                </Link>
                <Link href="/ai-advisor" className="text-krishi-text hover:text-krishi-primary transition-colors">
                  {t.aiAdvisor}
                </Link>
              </>
            )}
          </div>

          <LanguageToggle />
        </div>
      </div>
    </motion.nav>
  )
}
