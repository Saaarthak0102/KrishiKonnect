'use client'

import { MandiPrice } from '@/lib/mandiService'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

interface MandiPriceCardProps {
  price: MandiPrice
  isHighlighted?: boolean
}

export default function MandiPriceCard({
  price,
  isHighlighted = false,
}: MandiPriceCardProps) {
  const { lang } = useLanguage()
  const t = translations[lang]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '➡️'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getLastUpdatedLabel = (): string => {
    try {
      const dateObj = new Date(price.date)
      if (Number.isNaN(dateObj.getTime())) {
        return lang === 'hi' ? 'आज अपडेट' : 'Updated Today'
      }

      const now = new Date()
      const diffMs = now.getTime() - dateObj.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMinutes < 1) {
        return lang === 'hi' ? 'अभी अपडेट' : 'Just now'
      } else if (diffMinutes < 60) {
        const mins = diffMinutes
        return lang === 'hi'
          ? `${mins} ${mins === 1 ? 'मिनट' : 'मिनट'} पहले अपडेट`
          : `Updated ${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`
      } else if (diffHours < 24) {
        const hours = diffHours
        return lang === 'hi'
          ? `${hours} ${hours === 1 ? 'घंटा' : 'घंटे'} पहले अपडेट`
          : `Updated ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
      } else {
        const days = diffDays
        return lang === 'hi'
          ? `${days} ${days === 1 ? 'दिन' : 'दिन'} पहले अपडेट`
          : `Updated ${days} ${days === 1 ? 'day' : 'days'} ago`
      }
    } catch {
      return lang === 'hi' ? 'आज अपडेट' : 'Updated Today'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl border-2 p-6 transition-all duration-300 ${
        isHighlighted
          ? 'border-krishi-highlight bg-gradient-to-br from-krishi-highlight/10 to-transparent shadow-lg'
          : 'border-krishi-border bg-white hover:shadow-md'
      }`}
    >
      {/* Header - Crop and Mandi */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-krishi-text/60 uppercase tracking-wide">
            {price.cropEn}
          </h3>
          <p className="text-lg font-bold text-krishi-heading mt-1">
            {price.mandiEn}
          </p>
          <p className="text-xs text-krishi-text/70 mt-0.5">
            {price.district}, {price.state}
          </p>
        </div>
        <div className={`text-2xl ${getTrendColor(price.trend)}`}>
          {getTrendIcon(price.trend)}
        </div>
      </div>

      {/* Price Information */}
      <div className="mb-4 space-y-3 border-t border-krishi-border pt-4">
        {/* Modal Price - Highlighted */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-krishi-text">
            {lang === 'hi' ? 'मोडल भाव' : 'Modal Price'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-krishi-primary">
              ₹{price.modalPrice}
            </span>
            <span className="text-xs text-krishi-text/60">/q</span>
          </div>
        </div>

        {/* Min and Max Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-krishi-bg p-2">
            <p className="text-xs text-krishi-text/70 mb-1">
              {lang === 'hi' ? 'न्यूनतम' : 'Min'}
            </p>
            <p className="text-sm font-bold text-krishi-text">₹{price.minPrice}</p>
          </div>
          <div className="rounded-lg bg-krishi-bg p-2">
            <p className="text-xs text-krishi-text/70 mb-1">
              {lang === 'hi' ? 'अधिकतम' : 'Max'}
            </p>
            <p className="text-sm font-bold text-krishi-text">₹{price.maxPrice}</p>
          </div>
        </div>
      </div>

      {/* Date and Source - with Last Updated Info */}
      <div className="flex flex-col gap-2 border-t border-krishi-border pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-krishi-primary">
            {getLastUpdatedLabel()}
          </span>
          <span className="text-xs font-medium text-krishi-text/60">
            {price.source || 'Agmarknet'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
