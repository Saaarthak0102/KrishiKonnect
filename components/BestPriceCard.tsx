'use client'

import { MandiPrice } from '@/lib/mandiService'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

interface BestPriceCardProps {
  price: MandiPrice | null
  loading?: boolean
}

export default function BestPriceCard({ price, loading = false }: BestPriceCardProps) {
  const { lang } = useLanguage()
  const t = translations[lang]

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-krishi-border bg-white p-8 text-center"
      >
        <div className="h-6 w-6 mx-auto animate-spin rounded-full border-4 border-krishi-primary border-t-transparent"></div>
        <p className="mt-4 text-krishi-text/70">{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </motion.div>
    )
  }

  if (!price) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-dashed border-krishi-border bg-white p-8 text-center"
      >
        <p className="text-krishi-text/70">
          {lang === 'hi'
            ? 'इस फसल के लिए कोई डेटा उपलब्ध नहीं है।'
            : 'No data available for this crop.'}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border-3 border-krishi-highlight bg-gradient-to-br from-krishi-highlight/5 via-white to-transparent p-8 overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-krishi-highlight/10 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-krishi-agriculture/10 rounded-full -ml-16 -mb-16"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⭐</span>
          <h2 className="text-lg font-bold text-krishi-heading">
            {lang === 'hi' ? 'आज का सर्वश्रेष्ठ भाव' : 'Best Price Today'}
          </h2>
        </div>

        {/* Main Price Display */}
        <div className="mb-6">
          <p className="text-sm text-krishi-text/70 mb-2">
            {lang === 'hi' ? 'मोडल भाव' : 'Modal Price'}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-krishi-primary">
              ₹{price.modalPrice}
            </span>
            <span className="text-lg text-krishi-text/70">/q</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-white/50">
          <div>
            <p className="text-xs font-semibold text-krishi-text/70 uppercase tracking-wide mb-1">
              {lang === 'hi' ? 'फसल' : 'Crop'}
            </p>
            <p className="font-bold text-krishi-heading">{price.cropEn}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-krishi-text/70 uppercase tracking-wide mb-1">
              {lang === 'hi' ? 'मंडी' : 'Mandi'}
            </p>
            <p className="font-bold text-krishi-heading">{price.mandiEn}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-krishi-text/70 uppercase tracking-wide mb-1">
              {lang === 'hi' ? 'स्थान' : 'Location'}
            </p>
            <p className="font-bold text-krishi-heading">{price.district}</p>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 text-sm text-krishi-text/70 bg-krishi-bg rounded-lg p-3">
          <span>
            <strong>₹{price.minPrice}</strong> → <strong>₹{price.maxPrice}</strong>
          </span>
          <span className="ml-auto">
            {lang === 'hi' ? '(न्यूनतम - अधिकतम)' : '(Min - Max)'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
