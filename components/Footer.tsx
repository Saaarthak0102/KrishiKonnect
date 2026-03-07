'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { GiWheat } from 'react-icons/gi'

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
    <footer className="bg-white border-t-2 border-krishi-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GiWheat size={24} className="text-krishi-agriculture" />
              <h3 className="text-2xl font-bold text-krishi-heading">
                KrishiKonnect
              </h3>
            </div>
            <p className="text-krishi-text/80 text-sm">{t.footerTagline}</p>
          </div>

          {/* Quick Links (Landing Page Navigation) */}
          <div>
            <h4 className="font-semibold text-krishi-heading mb-4">
              {lang === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}
            </h4>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="text-krishi-text/80 hover:text-krishi-primary transition-colors text-sm"
                  whileHover={{ scale: 1.05, x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col justify-between">
            <p className="text-sm text-krishi-text/60">{t.allRightsReserved}</p>
            <div className="mt-4">
              <p className="text-xs text-krishi-text/50">
                {lang === 'hi'
                  ? 'किसानों के भविष्य के लिए डिजिटल समाधान'
                  : 'Digital solutions for farmers\' future'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="border-t border-krishi-border mt-8 pt-8">
          <p className="text-center text-xs text-krishi-text/50">
            {lang === 'hi'
              ? '© 2026 KrishiKonnect। सर्वाधिकार सुरक्षित।'
              : '© 2026 KrishiKonnect. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
