'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
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

export default function HeroSection() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const heroGreeting = lang === 'hi' ? 'नमस्ते किसान' : 'Namaste Kisan'

  return (
    <section id="home" className="max-w-6xl mx-auto px-6 py-24">
      <div className="flex flex-col items-center justify-center text-center min-h-[70vh] px-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <Image
            src="/images/icon.png"
            alt="KrishiKonnect Logo"
            width={120}
            height={120}
            priority
            className="object-contain mb-6"
          />
          <h1 className="text-5xl md:text-6xl font-bold text-[#2D2A6E] mb-4">
            {heroGreeting}
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-[#C46A3D] mb-6">
            {t.heroTagline}
          </p>
          <p className="max-w-2xl text-lg md:text-xl text-krishi-indigo/80 mb-8">
            {renderTextWithBrand(t.heroSubtext)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-block bg-krishi-clay text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {t.startUsing}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                className="inline-block border-2 border-krishi-clay text-krishi-clay px-8 py-4 rounded-lg font-semibold text-lg hover:bg-krishi-clay hover:text-white transition-colors"
              >
                {t.exploreFeatures}
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
