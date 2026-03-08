'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, memo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import Toast from '@/components/Toast'
import { FiStar } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa'

interface Crop {
  id: string
  name_en: string
  name_hi: string
  season_en: string
  season_hi: string
  image: string
}

interface CropCardProps {
  crop: Crop
}

// Helper function to get season badge style with tinted glass effect
const getSeasonBadgeStyle = (seasonEn: string) => {
  const normalized = seasonEn.toLowerCase().replace(/\s+/g, '')
  const isMultiSeason = normalized.includes('/')

  if (isMultiSeason || seasonEn === 'Year-round') {
    return {
      background: 'rgba(120,120,120,0.10)',
      color: 'rgba(45,42,110,0.75)',
      border: '1px solid rgba(120,120,120,0.25)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }
  }

  const season = seasonEn.split('/')[0].trim()
  
  if (season === 'Rabi') {
    return {
      background: 'rgba(46,157,87,0.12)',
      color: '#2E9D57',
      border: '1px solid rgba(46,157,87,0.30)',
      boxShadow: '0 0 10px rgba(46,157,87,0.15)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }
  }

  if (season === 'Kharif') {
    return {
      background: 'rgba(196,106,61,0.12)',
      color: '#C46A3D',
      border: '1px solid rgba(196,106,61,0.30)',
      boxShadow: '0 0 10px rgba(196,106,61,0.15)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }
  }

  if (season === 'Zaid') {
    return {
      background: 'rgba(45,42,110,0.12)',
      color: '#2D2A6E',
      border: '1px solid rgba(45,42,110,0.30)',
      boxShadow: '0 0 10px rgba(45,42,110,0.15)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }
  }

  // Default fallback
  return {
    background: 'rgba(120,120,120,0.10)',
    color: 'rgba(45,42,110,0.75)',
    border: '1px solid rgba(120,120,120,0.25)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)'
  }
}

// Applies soft seasonal tint to the card banner while keeping image layout unchanged.
const getSeasonImageBackground = (seasonEn: string) => {
  const normalized = seasonEn.toLowerCase().replace(/\s+/g, '')

  if (normalized.includes('/')) {
    return 'linear-gradient(rgba(80,140,80,0.18), rgba(80,140,80,0.08))'
  }

  if (normalized.includes('rabi')) {
    return 'linear-gradient(rgba(46,157,87,0.20), rgba(46,157,87,0.10))'
  }

  if (normalized.includes('kharif')) {
    return 'linear-gradient(rgba(196,106,61,0.18), rgba(196,106,61,0.08))'
  }

  if (normalized.includes('zaid') || normalized.includes('year-round') || normalized.includes('yearround')) {
    return 'linear-gradient(rgba(45,42,110,0.18), rgba(45,42,110,0.08))'
  }

  return 'linear-gradient(rgba(80,140,80,0.18), rgba(80,140,80,0.08))'
}

export default memo(function CropCard({ crop }: CropCardProps) {
  const { lang } = useLanguage()
  const { isStarred, toggleStar } = useStarredCrops()
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const cropName = lang === 'hi' ? crop.name_hi : crop.name_en
  const seasonName = lang === 'hi' ? crop.season_hi : crop.season_en

  const handleStarClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const result = await toggleStar(crop.id)
    setToastMessage(result.message || '')
    setShowToast(true)
  }

  return (
    <>
      <Link href={`/crop-library/${crop.id}`}>
        <motion.div
          whileHover={{
            y: -4,
            scale: 1.01,
            boxShadow: '0 16px 32px rgba(0,0,0,0.10), 0 0 14px rgba(45,42,110,0.12)',
            borderColor: 'rgba(196,106,61,0.35)',
            transition: { duration: 0.12, ease: 'easeOut' },
          }}
          whileTap={{ scale: 0.97, transition: { duration: 0.08, ease: 'easeOut' } }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="relative h-full overflow-hidden cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,106,61,0.25)',
            borderRadius: '16px',
            boxShadow: '0 10px 24px rgba(0,0,0,0.08), 0 0 12px rgba(45,42,110,0.08)',
            transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out, border-color 0.12s ease-out, background 0.12s ease-out',
            willChange: 'transform, box-shadow',
            transform: 'translateZ(0)',
          }}
        >
          {/* Crop Image with Star Overlay */}
          <div
            className="relative w-full h-48 overflow-hidden rounded-t-[16px]"
            style={{ background: getSeasonImageBackground(crop.season_en) }}
          >
            <img
              src={crop.image}
              alt={cropName}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            {/* Star Button Overlay */}
            <motion.button
              onClick={handleStarClick}
              onMouseDown={(e) => e.preventDefault()}
              whileTap={{ scale: 1.15 }}
              whileHover={{ scale: 1.12 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-3 right-3 z-10 rounded-full flex items-center justify-center transition-transform duration-[150ms] ease-out"
              style={{
                width: '34px',
                height: '34px',
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(196,106,61,0.25)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              aria-label={isStarred(crop.id) ? 'Remove from My Crops' : 'Add to My Crops'}
              title={isStarred(crop.id) ? 'Remove from My Crops' : 'Add to My Crops'}
            >
              {isStarred(crop.id) ? (
                <FaStar
                  size={18}
                  style={{ color: '#C46A3D', filter: 'drop-shadow(0 0 6px rgba(196,106,61,0.35))' }}
                />
              ) : (
                <FiStar size={18} style={{ color: 'rgba(45,42,110,0.6)' }} />
              )}
            </motion.button>
          </div>

          {/* Content Section */}
          <div style={{ padding: '14px 16px' }}>
            {/* Crop Name */}
            <h3
              className="truncate"
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#2D2A6E',
                marginTop: '8px',
                marginBottom: '8px',
                textShadow: '0 0 6px rgba(45,42,110,0.05)',
              }}
            >
              {cropName}
            </h3>

            {/* Season Badge */}
            <div className="inline-block">
              <span 
                className="rounded-full px-[12px] py-[4px] text-[0.8rem] font-semibold transition-all duration-[250ms] ease-out hover:scale-[1.05]"
                style={getSeasonBadgeStyle(crop.season_en)}
              >
                {seasonName}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  )
})
 
