'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import LanguageToggle from './LanguageToggle'
import { GiWheat } from 'react-icons/gi'

export default function LandingNavbar() {
  const { lang } = useLanguage()
  const t = translations[lang]

  const navLinks = [
    { href: '#home', label: t.home },
    { href: '#features', label: lang === 'hi' ? 'सुविधाएं' : 'Features' },
    { href: '#how-it-works', label: t.howItWorksHeading },
    { href: '#ai-advisor', label: t.aiAdvisor },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm border-b-2 border-krishi-border shadow-sm"
    >
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4 md:px-8 lg:px-12">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <GiWheat size={24} className="text-krishi-agriculture" />
            <span className="text-2xl font-bold text-krishi-heading">
              KrishiKonnect
            </span>
          </Link>

          {/* Center - Navigation Links (hidden on mobile) */}
          <div className="hidden md:flex items-center justify-center gap-10 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-krishi-text hover:text-krishi-primary transition-colors font-medium text-base whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right - Language Toggle */}
          <div className="flex-shrink-0">
            <LanguageToggle />
          </div>

          {/* Mobile menu button (placeholder for future mobile menu) */}
          <button className="md:hidden ml-4 p-2 text-krishi-heading">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
