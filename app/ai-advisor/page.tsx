'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function AIAdvisorPage() {
  const [language, setLanguage] = useState('hi')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const lang = localStorage.getItem('language') || 'hi'
    setLanguage(lang)
  }, [])

  const content = {
    hi: {
      title: 'AI सलाहकार 🤖',
      subtitle: 'कृषि विशेषज्ञ की तरह सलाह पाएं',
      description: 'अपनी फसल, मिट्टी, और खेती से जुड़े सवाल पूछें।',
      placeholder: 'अपना सवाल यहाँ लिखें...',
      askButton: 'सलाह लें',
      exampleTitle: 'उदाहरण सवाल:',
      example: 'टमाटर की पत्तियाँ पीली हो रही हैं, क्या करूँ?'
    },
    en: {
      title: 'AI Advisor 🤖',
      subtitle: 'Get expert agricultural advice',
      description: 'Ask questions about your crops, soil, and farming.',
      placeholder: 'Type your question here...',
      askButton: 'Get Advice',
      exampleTitle: 'Example question:',
      example: 'Tomato leaves are turning yellow, what should I do?'
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
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm mb-6">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:border-krishi-primary outline-none resize-none"
              rows={4}
              placeholder={t.placeholder}
            />
            <button className="mt-4 w-full bg-krishi-primary text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
              {t.askButton}
            </button>
          </div>

          <div className="bg-krishi-agriculture/10 border-2 border-krishi-agriculture rounded-lg p-6">
            <p className="text-sm text-krishi-text/70 mb-2">{t.exampleTitle}</p>
            <p className="text-krishi-text italic">"{t.example}"</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
