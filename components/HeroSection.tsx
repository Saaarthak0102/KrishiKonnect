'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { GiWheat } from 'react-icons/gi'

export default function HeroSection() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section id="home" className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-krishi-heading mb-3">
            {t.heroHeadline}
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-krishi-primary mb-6">
            {t.heroTagline}
          </p>
          <p className="text-lg md:text-xl text-krishi-text/80 mb-8">
            {t.heroSubtext}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-block bg-krishi-primary text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {t.startUsing}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                className="inline-block border-2 border-krishi-primary text-krishi-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-krishi-primary hover:text-white transition-colors"
              >
                {t.exploreFeatures}
              </a>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-krishi-agriculture/20 border-2 border-krishi-agriculture rounded-2xl p-8 md:p-12 text-center">
            <div className="text-8xl mb-4 flex justify-center">
              <GiWheat size={96} className="text-krishi-agriculture" />
            </div>
            <p className="text-2xl font-semibold text-krishi-heading">
              {t.harvestSuccess}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
