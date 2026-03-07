'use client'

import { memo } from 'react'
import { MandiPrice } from '@/lib/mandiService'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FiMapPin, FiMinus, FiTrendingDown, FiTrendingUp } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { getRelativeTime, isLivePrice } from '@/lib/timeUtils'

interface MandiPriceCardProps {
  price: MandiPrice
  isHighlighted?: boolean
  onViewTrend?: (mandiId: string) => void
}

function MandiPriceCard({
  price,
  isHighlighted = false,
  onViewTrend,
}: MandiPriceCardProps) {
  const router = useRouter()
  const { lang } = useLanguage()

  const handleRequestTransport = () => {
    router.push(
      `/transport?crop=${encodeURIComponent(price.cropEn)}&mandi=${encodeURIComponent(price.mandiEn)}`
    )
  }

  const getTrendStyles = (trend: string) => {
    switch (trend) {
      case 'up':
        return {
          cardBackground: 'rgba(46,157,87,0.12)',
          cardBorder: '1px solid rgba(46,157,87,0.25)',
          icon: FiTrendingUp,
          iconColor: '#2E9D57',
        }
      case 'down':
        return {
          cardBackground: 'rgba(196,106,61,0.12)',
          cardBorder: '1px solid rgba(196,106,61,0.25)',
          icon: FiTrendingDown,
          iconColor: '#C46A3D',
        }
      case 'stable':
        return {
          cardBackground: 'rgba(45,42,110,0.08)',
          cardBorder: '1px solid rgba(45,42,110,0.18)',
          icon: FiMinus,
          iconColor: '#2D2A6E',
        }
      default:
        return {
          cardBackground: 'rgba(45,42,110,0.08)',
          cardBorder: '1px solid rgba(45,42,110,0.18)',
          icon: FiMinus,
          iconColor: '#2D2A6E',
        }
    }
  }

  const trendStyles = getTrendStyles(price.trend)
  const TrendIcon = trendStyles.icon

  const getLastUpdatedLabel = (): string => {
    // Try both possible field names for timestamp
    const timestamp = (price as any).date || (price as any).lastUpdated
    
    if (!timestamp) {
      return lang === 'hi' ? 'आज अपडेट' : 'Updated today'
    }
    
    return getRelativeTime(timestamp, lang === 'hi' ? 'hi' : 'en')
  }

  const getLiveIndicator = (): boolean => {
    // Try both possible field names for timestamp
    const timestamp = (price as any).date || (price as any).lastUpdated
    
    if (!timestamp) {
      return false
    }
    
    return isLivePrice(timestamp)
  }

  return (
    <motion.div
      whileHover={{
        y: -3,
        boxShadow: '0 14px 35px rgba(0,0,0,0.12), 0 0 14px rgba(45,42,110,0.10)',
        borderColor: 'rgba(196,106,61,0.35)',
      }}
      className={`p-5 md:p-6 transition-all duration-[250ms] ease-out ${
        isHighlighted ? 'ring-2 ring-krishi-primary' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,106,61,0.25)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="mb-1 flex items-center">
          <motion.span whileHover={{ y: -1 }} transition={{ duration: 0.2 }} className="mr-[6px] inline-flex">
            <FiMapPin size={20} style={{ color: '#2D2A6E', opacity: 0.85 }} />
          </motion.span>
          <h3
            className="font-semibold"
            style={{ fontSize: '1.2rem', color: '#2D2A6E', letterSpacing: '-0.2px' }}
          >
            {price.mandiEn}
          </h3>
        </div>
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
            className="font-bold"
            style={{ fontSize: '2rem', color: '#2D2A6E', letterSpacing: '-0.5px' }}
          >
            ₹{price.modalPrice.toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'rgba(45,42,110,0.65)' }}>/ quintal</span>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-7 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-1" style={{ fontSize: '0.85rem', color: 'rgba(45,42,110,0.6)', fontWeight: 500 }}>
            {lang === 'hi' ? 'न्यूनतम' : 'Minimum'}
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2D2A6E' }}>
            ₹{price.minPrice.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="mb-1" style={{ fontSize: '0.85rem', color: 'rgba(45,42,110,0.6)', fontWeight: 500 }}>
            {lang === 'hi' ? 'अधिकतम' : 'Maximum'}
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2D2A6E' }}>
            ₹{price.maxPrice.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Trend Section */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{
          background: trendStyles.cardBackground,
          border: trendStyles.cardBorder,
        }}
      >
        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold">
          {lang === 'hi' ? 'बाजार प्रवृत्ति' : 'Market Trend'}
        </p>
        <div className="flex items-center gap-3">
          <motion.span whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
            <TrendIcon size={20} style={{ color: trendStyles.iconColor }} />
          </motion.span>
          <span
            className="text-lg font-semibold"
            style={{ color: trendStyles.iconColor }}
          >
            {price.trend === 'up' && '+'}
            {price.trend === 'down' && '-'}
            {price.trend === 'stable' && ''}
            2.0%
          </span>
        </div>
      </div>

      {/* Last Updated with Live Indicator */}
      <div className="mb-4 flex items-center gap-2">
        {getLiveIndicator() && (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium">
              {lang === 'hi' ? 'लाइव भाव' : 'Live price'}
            </span>
          </div>
        )}
        <p className="text-xs text-gray-600">
          {getLastUpdatedLabel()}
        </p>
      </div>

      {/* Last Updated & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-300">
        <div></div>
        {onViewTrend && (
          <motion.button
            onClick={() => onViewTrend(price.id)}
            className="text-xs font-medium px-3 py-2 rounded-[10px] transition-all duration-[200ms] ease-out"
            style={{
              color: '#2D2A6E',
              background: 'rgba(45,42,110,0.08)',
              border: '1px solid rgba(45,42,110,0.25)',
            }}
            whileHover={{ scale: 1.02, backgroundColor: '#2D2A6E', color: '#FFFFFF' }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {lang === 'hi' ? 'चार्ट देखें' : 'View Chart'}
          </motion.button>
        )}
      </div>

      {/* Request Transport Button */}
      <div className="mt-6">
        <motion.button
          onClick={handleRequestTransport}
          className="w-full py-3 px-[18px] rounded-[10px] text-white font-medium transition-all duration-[200ms] ease-out"
          style={{ background: '#2D2A6E' }}
          whileHover={{
            scale: 1.02,
            backgroundColor: '#3A378A',
            boxShadow: '0 6px 16px rgba(45,42,110,0.25)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          {lang === 'hi' ? 'परिवहन का अनुरोध करें' : 'Request Transport'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default memo(MandiPriceCard)
