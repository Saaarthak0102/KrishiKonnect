'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function CTASection() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-krishi-primary text-white rounded-2xl p-8 md:p-12 text-center shadow-xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          {t.ctaHeading}
        </h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          {t.ctaSubtext}
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/login"
            className="inline-block bg-white text-krishi-primary px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {t.getStarted}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
