'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function CropLibraryPage() {
  const [language, setLanguage] = useState('hi')

  useEffect(() => {
    const lang = localStorage.getItem('language') || 'hi'
    setLanguage(lang)
  }, [])

  const content = {
    hi: {
      title: 'फसल पुस्तकालय 🌾',
      subtitle: 'हर फसल के बारे में विस्तृत जानकारी',
      description: 'यहाँ आपको विभिन्न फसलों की जानकारी, खेती के तरीके, और बेहतर उपज के टिप्स मिलेंगे।'
    },
    en: {
      title: 'Crop Library 🌾',
      subtitle: 'Detailed information about every crop',
      description: 'Find information about different crops, cultivation methods, and tips for better yield.'
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Placeholder crop cards will be added here */}
          <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">🌾</div>
            <h3 className="text-xl font-semibold text-krishi-heading mb-2">
              {language === 'hi' ? 'गेहूँ' : 'Wheat'}
            </h3>
            <p className="text-krishi-text/80">
              {language === 'hi' ? 'रबी सीजन की प्रमुख फसल' : 'Major Rabi season crop'}
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
