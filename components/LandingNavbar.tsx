'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import LanguageToggle from './LanguageToggle'
import Image from 'next/image'
import BrandName from '@/components/ui/BrandName'

export default function LandingNavbar() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/55 backdrop-blur-[12px] border-b border-[rgba(196,106,61,0.35)] shadow-[0_8px_25px_rgba(45,42,110,0.12)]'
          : 'bg-transparent border-b-0'
      }`}
      style={isScrolled ? { WebkitBackdropFilter: 'blur(12px)' } as React.CSSProperties : {}}
    >
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4 md:px-8 lg:px-12">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="/images/icon.png"
              alt="KrishiKonnect Logo"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
            <span className="text-xl font-semibold">
              <BrandName />
            </span>
          </Link>

          {/* Center - Navigation Links (hidden on mobile) */}
          <div className="hidden md:flex items-center justify-center gap-10 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-krishi-indigo hover:text-krishi-clay transition-colors font-medium text-base whitespace-nowrap"
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
          <button className="md:hidden ml-4 p-2 text-krishi-indigo">
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
