'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function TransportPage() {
  const [language, setLanguage] = useState('hi')

  useEffect(() => {
    const lang = localStorage.getItem('language') || 'hi'
    setLanguage(lang)
  }, [])

  const content = {
    hi: {
      title: 'परिवहन सेवा 🚚',
      subtitle: 'अपनी फसल को मंडी तक पहुंचाएं',
      description: 'किफायती और भरोसेमंद परिवहन सेवाएं खोजें।'
    },
    en: {
      title: 'Transport Service 🚚',
      subtitle: 'Get your crops to the market',
      description: 'Find affordable and reliable transport services.'
    }
  }

  const t = content[language as keyof typeof content]

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
            {t.title}
          </h1>
          <p className="text-xl text-krishi-text mb-2">{t.subtitle}</p>
          <p className="text-krishi-text/80 max-w-2xl mx-auto">{t.description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-krishi-heading mb-4">
              {language === 'hi' ? 'परिवहन बुक करें' : 'Book Transport'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-krishi-text mb-2">
                  {language === 'hi' ? 'शुरुआती स्थान' : 'Starting Location'}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-2 border-krishi-border rounded-lg focus:border-krishi-primary outline-none"
                  placeholder={language === 'hi' ? 'अपना गाँव या शहर दर्ज करें' : 'Enter your village or city'}
                />
              </div>
              <div>
                <label className="block text-krishi-text mb-2">
                  {language === 'hi' ? 'गंतव्य मंडी' : 'Destination Mandi'}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border-2 border-krishi-border rounded-lg focus:border-krishi-primary outline-none"
                  placeholder={language === 'hi' ? 'मंडी का नाम दर्ज करें' : 'Enter mandi name'}
                />
              </div>
              <button className="w-full bg-krishi-primary text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
                {language === 'hi' ? 'परिवहन खोजें' : 'Find Transport'}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
