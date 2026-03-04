'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CropCard from '@/components/CropCard'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import cropsData from '@/data/crops.json'

export default function CropLibraryPage() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-krishi-bg">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-krishi-heading mb-4">
            {t.cropLibraryTitle}
          </h1>
          <p className="text-xl text-krishi-text mb-2">{t.cropLibrarySubtitle}</p>
          <p className="text-krishi-text/80 max-w-2xl mx-auto">{t.cropLibraryDescription}</p>
        </motion.div>

        {/* Crop Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cropsData.map((crop, index) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <CropCard crop={crop} />
            </motion.div>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
