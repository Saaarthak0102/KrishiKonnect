'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { GiWheat } from 'react-icons/gi'
import BrandName from '@/components/ui/BrandName'

function renderTextWithBrand(text: string) {
  const parts = text.split('KrishiKonnect')
  if (parts.length === 1) {
    return text
  }

  return parts.map((part, index) => (
    <span key={`brand-part-${index}`}>
      {part}
      {index < parts.length - 1 ? <BrandName /> : null}
    </span>
  ))
}

export default function Footer() {
  const { lang } = useLanguage()
  const t = translations[lang]

  const quickLinks = [
    { href: '#home', label: t.home },
    { href: '#features', label: lang === 'hi' ? 'सुविधाएं' : 'Features' },
    { href: '#how-it-works', label: t.howItWorksHeading },
    { href: '#ai-advisor', label: t.aiAdvisor },
  ]

  return (
    <footer className="bg-transparent border-t border-krishi-clay/20 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Section */}
          <div className="flex items-center gap-2">
            <GiWheat size={24} className="text-krishi-agriculture" />
            <div>
              <h3 className="text-xl">
                <BrandName />
              </h3>
              <p className="text-krishi-indigo/70 text-xs">{t.footerTagline}</p>
            </div>
          </div>

          {/* Quick Links - Horizontal */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {quickLinks.map((link, index) => (
              <span key={link.href} className="flex items-center gap-6">
                <motion.a
                  href={link.href}
                  className="text-krishi-indigo/80 hover:text-krishi-clay transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.a>
                {index < quickLinks.length - 1 && (
                  <span className="text-krishi-clay/40">•</span>
                )}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-500">
              {lang === 'hi'
                ? <>© 2026 <BrandName />। सर्वाधिकार सुरक्षित।</>
                : <>© 2026 <BrandName />. All rights reserved.</>}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
