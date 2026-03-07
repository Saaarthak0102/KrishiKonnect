'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import BrandName from '@/components/ui/BrandName'

export default function LanguageSelector() {
  const router = useRouter()

  const selectLanguage = (lang: 'hi' | 'en') => {
    localStorage.setItem('app_language', lang)
    router.push('/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white/75 backdrop-blur-md border-2 border-krishi-border rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full mx-4"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-krishi-indigo mb-3">
          <BrandName /> 🌾
        </h1>
        <p className="text-krishi-indigo/80">
          किसानों के लिए डिजिटल प्लेटफॉर्म
        </p>
        <p className="text-krishi-indigo/80">
          Digital Platform for Farmers
        </p>
      </div>

      <div className="space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => selectLanguage('hi')}
          className="w-full bg-krishi-clay text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
        >
          हिंदी में जारी रखें 🇮🇳
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => selectLanguage('en')}
          className="w-full bg-krishi-indigo text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
        >
          Continue in English 🇬🇧
        </motion.button>
      </div>
    </motion.div>
  )
}
