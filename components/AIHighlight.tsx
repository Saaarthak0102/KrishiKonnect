'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function AIHighlight() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-krishi-agriculture/20 to-krishi-highlight/20 border-2 border-krishi-agriculture rounded-2xl p-8 md:p-12"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-krishi-heading mb-4">
            {t.aiHighlightHeading}
          </h2>
          <p className="text-lg text-krishi-text/80">
            {t.aiHighlightSubtext}
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white border-2 border-krishi-border rounded-lg p-6 mb-6 shadow-md">
          <p className="text-sm text-krishi-text/70 mb-3">{t.aiExampleTitle}</p>
          <div className="space-y-4">
            <div className="bg-krishi-bg p-4 rounded-lg">
              <p className="text-krishi-text font-medium">{t.aiExampleQuestion}</p>
            </div>
            <div className="bg-krishi-agriculture/10 p-4 rounded-lg border-l-4 border-krishi-agriculture">
              <p className="text-krishi-text">{t.aiExampleAnswer}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/ai-advisor"
              className="inline-block bg-krishi-primary text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {t.aiTryButton}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
