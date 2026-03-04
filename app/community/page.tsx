'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function CommunityPage() {
  const [language, setLanguage] = useState('hi')

  useEffect(() => {
    const lang = localStorage.getItem('language') || 'hi'
    setLanguage(lang)
  }, [])

  const content = {
    hi: {
      title: 'किसान समुदाय 🤝',
      subtitle: 'अपने साथी किसानों से जुड़ें',
      description: 'अनुभव साझा करें, सवाल पूछें, और एक-दूसरे की मदद करें।'
    },
    en: {
      title: 'Farmer Community 🤝',
      subtitle: 'Connect with fellow farmers',
      description: 'Share experiences, ask questions, and help each other.'
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
          className="max-w-4xl mx-auto space-y-4"
        >
          <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-3xl">👨‍🌾</div>
              <div className="flex-1">
                <h3 className="font-semibold text-krishi-heading mb-2">
                  {language === 'hi' ? 'राज कुमार' : 'Raj Kumar'}
                </h3>
                <p className="text-krishi-text">
                  {language === 'hi' 
                    ? 'टमाटर की खेती में कीट नियंत्रण के लिए कोई सुझाव?'
                    : 'Any suggestions for pest control in tomato farming?'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
