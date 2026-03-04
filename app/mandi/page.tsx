'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function MandiPage() {
  const [language, setLanguage] = useState('hi')

  useEffect(() => {
    const lang = localStorage.getItem('language') || 'hi'
    setLanguage(lang)
  }, [])

  const content = {
    hi: {
      title: 'मंडी भाव 💰',
      subtitle: 'आज के ताजा मंडी दरें',
      description: 'अपने क्षेत्र की मंडी में फसलों के वर्तमान भाव जानें और सही समय पर बेचें।'
    },
    en: {
      title: 'Mandi Prices 💰',
      subtitle: "Today's fresh market rates",
      description: 'Know the current prices of crops in your area market and sell at the right time.'
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
          className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm max-w-4xl mx-auto"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-krishi-border pb-3">
              <span className="font-semibold text-krishi-heading">
                {language === 'hi' ? 'फसल' : 'Crop'}
              </span>
              <span className="font-semibold text-krishi-heading">
                {language === 'hi' ? 'भाव (₹/क्विंटल)' : 'Price (₹/quintal)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-krishi-text">{language === 'hi' ? 'गेहूँ' : 'Wheat'}</span>
              <span className="text-krishi-highlight font-bold">₹2,150</span>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
