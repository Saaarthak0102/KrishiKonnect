'use client'

import Footer from '@/components/Footer'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function MandiPage() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <FeaturePageLayout>
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-krishi-heading mb-4">
              {t.mandiTitle}
            </h1>
            <p className="text-xl text-krishi-text mb-2">{t.mandiSubtitle}</p>
            <p className="text-krishi-text/80 max-w-2xl mx-auto">{t.mandiDescription}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm max-w-4xl mx-auto"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-krishi-border pb-3">
                <span className="font-semibold text-krishi-heading">
                  {t.crop}
                </span>
                <span className="font-semibold text-krishi-heading">
                  {t.pricePerQuintal}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-krishi-text">{lang === 'hi' ? 'गेहूँ' : 'Wheat'}</span>
                <span className="text-krishi-highlight font-bold">₹2,150</span>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </FeaturePageLayout>
  )
}
