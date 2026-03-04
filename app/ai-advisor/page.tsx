'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function AIAdvisorPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [query, setQuery] = useState('')

  return (
    <div className="min-h-screen bg-krishi-bg">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-krishi-heading mb-4">
            {t.aiAdvisorTitle}
          </h1>
          <p className="text-xl text-krishi-text mb-2">{t.aiAdvisorSubtitle}</p>
          <p className="text-krishi-text/80 max-w-2xl mx-auto">{t.aiAdvisorDescription}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm mb-6">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:border-krishi-primary outline-none resize-none"
              rows={4}
              placeholder={t.askQuestion}
            />
            <button className="mt-4 w-full bg-krishi-primary text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
              {t.getAdvice}
            </button>
          </div>

          <div className="bg-krishi-agriculture/10 border-2 border-krishi-agriculture rounded-lg p-6">
            <p className="text-sm text-krishi-text/70 mb-2">{t.exampleQuestion}</p>
            <p className="text-krishi-text italic">"{t.sampleAiQuestion}"</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
