'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function TransportPage() {
  const { lang } = useLanguage()
  const t = translations[lang]

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
            {t.transportTitle}
          </h1>
          <p className="text-xl text-krishi-text mb-2">{t.transportSubtitle}</p>
          <p className="text-krishi-text/80 max-w-2xl mx-auto">{t.transportDescription}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-krishi-heading mb-4">
              {t.bookTransport}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-krishi-text mb-2">
                  {t.pickupLocation}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-2 border-krishi-border rounded-lg focus:border-krishi-primary outline-none"
                  placeholder={t.pickupPlaceholder}
                />
              </div>
              <div>
                <label className="block text-krishi-text mb-2">
                  {t.destination}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-2 border-krishi-border rounded-lg focus:border-krishi-primary outline-none"
                  placeholder={t.destinationPlaceholder}
                />
              </div>
              <button className="w-full bg-krishi-primary text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
                {t.findTransport}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
