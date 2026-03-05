'use client'

import { MandiPrice } from '@/lib/mandiService'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { getTrendColor } from '@/lib/trendUtils'

interface MandiPriceCardProps {
  price: MandiPrice
  isHighlighted?: boolean
  onViewTrend?: () => void
}

export default function MandiPriceCard({
  price,
  isHighlighted = false,
  onViewTrend,
}: MandiPriceCardProps) {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang]

  const handleRequestTransport = () => {
    router.push(
      `/transport?crop=${encodeURIComponent(price.cropEn)}&mandi=${encodeURIComponent(price.mandiEn)}`
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '⬆'
      case 'down':
        return '⬇'
      default:
        return '→'
    }
  }

  const getTrendBgColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'rgba(127, 176, 105, 0.1)'
      case 'down':
        return 'rgba(184, 92, 56, 0.1)'
      case 'stable':
        return 'rgba(242, 165, 65, 0.1)'
      default:
        return '#f0f0f0'
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
      className={`rounded-xl border-0 p-5 md:p-6 transition-all duration-300 shadow-md hover:shadow-lg ${
        isHighlighted ? 'ring-2 ring-krishi-primary' : ''
      }`}
      style={{
        backgroundColor: '#FAF3E0',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-lg md:text-xl font-bold mb-1"
          style={{ color: '#1F3C88' }}
        >
          {price.mandiEn}
        </h3>
        <p className="text-sm text-gray-600">
          {price.district}, {price.state}
        </p>
      </div>

      {/* Main Price Display */}
      <div className="mb-6 pb-6 border-b border-gray-300">
        <p className="text-gray-500 text-xs uppercase tracking-wide mb-2 font-semibold">
          {lang === 'hi' ? 'मोडल भाव (प्रति क्विंटल)' : 'Modal Price (Per Quintal)'}
        </p>
        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl md:text-5xl font-bold"
            style={{ color: '#1F3C88' }}
          >
            ₹{price.modalPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-600 text-sm">/quintal</span>
        </div>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">
            {lang === 'hi' ? 'न्यूनतम' : 'Minimum'}
          </p>
          <p className="text-lg font-semibold" style={{ color: '#1F3C88' }}>
            ₹{price.minPrice.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">
            {lang === 'hi' ? 'अधिकतम' : 'Maximum'}
          </p>
          <p className="text-lg font-semibold" style={{ color: '#1F3C88' }}>
            ₹{price.maxPrice.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Trend Section */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: getTrendBgColor(price.trend) }}
      >
        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold">
          {lang === 'hi' ? 'बाजार प्रवृत्ति' : 'Market Trend'}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-3xl" style={{ color: getTrendColor(price.trend) }}>
            {getTrendIcon(price.trend)}
          </span>
          <span
            className="text-lg font-semibold"
            style={{ color: getTrendColor(price.trend) }}
          >
            {price.trend === 'up' && '+'}
            {price.trend === 'down' && '-'}
            {price.trend === 'stable' && ''}
            2.0%
          </span>
        </div>
      </div>

      {/* Last Updated & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-300">
        <p className="text-xs text-gray-600">
          {lang === 'hi' ? 'अपडेट' : 'Updated'}:{' '}
          <span className="font-medium">{getLastUpdatedLabel()}</span>
        </p>
        {onViewTrend && (
          <button
            onClick={onViewTrend}
            className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            style={{
              color: '#1F3C88',
              backgroundColor: '#E8DCC8',
              border: '1px solid #D4C4A8',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D4C4A8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E8DCC8';
            }}
          >
            {lang === 'hi' ? 'चार्ट देखें' : 'View Chart'}
          </button>
        )}
      </div>

      {/* Request Transport Button */}
      <div className="mt-6">
        <button
          onClick={handleRequestTransport}
          className="w-full font-semibold py-3 px-4 rounded-lg text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#1F3C88' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#162847'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1F3C88'
          }}
        >
          {lang === 'hi' ? 'परिवहन का अनुरोध करें' : 'Request Transport'}
        </button>
      </div>
    </motion.div>
  )
}
