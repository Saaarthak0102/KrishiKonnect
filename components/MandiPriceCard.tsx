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
      `/transport?crop=${encodeURIComponent(price.cropEn)}&mandi=${encodeURIComponent(price.mandiEn)}&book=true`
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
        y: -4,
        scale: 1.01,
        boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.16)',
        borderColor: 'rgba(196,106,61,0.35)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`p-5 md:p-6 transition-all duration-[250ms] ease-out ${
        isHighlighted ? 'ring-2 ring-krishi-primary' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,106,61,0.25)',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
        willChange: 'transform, box-shadow, opacity',
        transform: 'translateZ(0)',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="mb-1 flex items-center">
          <motion.span whileHover={{ y: -2, scale: 1.05 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="mr-[6px] inline-flex">
            <FiMapPin size={20} style={{ color: '#2D2A6E', opacity: 0.85 }} />
          </motion.span>
          <h3
            className="font-semibold"
            style={{ fontSize: '1.2rem', color: '#2D2A6E', letterSpacing: '-0.2px' }}
          >
            {price.mandiEn}
          </h3>
        </div>
        <p className="text-sm" style={{ color: 'rgba(45,42,110,0.72)' }}>
          {price.district}, {price.state}
        </p>
      </div>

      {/* Main Price Display */}
      <div className="mb-6 pb-6 border-b" style={{ borderColor: 'rgba(45,42,110,0.16)' }}>
        <p className="text-xs uppercase tracking-wide mb-2 font-semibold" style={{ color: 'rgba(45,42,110,0.66)' }}>
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
        className="rounded-lg p-4 mb-4 badge-glow"
        style={{
          background: trendStyles.cardBackground,
          border: trendStyles.cardBorder,
        }}
      >
        <p className="text-xs uppercase tracking-wide mb-2 font-semibold" style={{ color: 'rgba(45,42,110,0.68)' }}>
          {lang === 'hi' ? 'बाजार प्रवृत्ति' : 'Market Trend'}
        </p>
        <div className="flex items-center gap-3">
          <motion.span whileHover={{ y: -2, scale: 1.05 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
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
          <div className="badge-glow flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium">
              {lang === 'hi' ? 'लाइव भाव' : 'Live price'}
            </span>
          </div>
        )}
        <p className="text-xs" style={{ color: 'rgba(45,42,110,0.68)' }}>
          {getLastUpdatedLabel()}
        </p>
      </div>

      {/* Last Updated & Action */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(45,42,110,0.16)' }}>
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
            whileHover={{ scale: 1.03, y: -2, backgroundColor: '#242159', color: '#FFFFFF', boxShadow: '0 8px 16px rgba(45,42,110,0.24)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
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
            scale: 1.03,
            y: -2,
            backgroundColor: '#242159',
            boxShadow: '0 10px 20px rgba(45,42,110,0.26), 0 0 12px rgba(45,42,110,0.2)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {lang === 'hi' ? 'परिवहन का अनुरोध करें' : 'Request Transport'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default memo(MandiPriceCard)
