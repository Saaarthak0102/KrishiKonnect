'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, memo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import Toast from '@/components/Toast'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'

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

// Helper function to get badge color and classes based on season
const getSeasonBadgeClass = (seasonEn: string) => {
  const season = seasonEn.split('/')[0].trim() // Handle composite seasons like "Kharif / Rabi"
  
  if (season === 'Rabi') return 'bg-[#7FB069] text-white'
  if (season === 'Kharif') return 'bg-[#F2A541] text-white'
  if (season === 'Zaid') return 'bg-[#B85C38] text-white'
  if (season === 'Year-round') return 'bg-[#1F3C88] text-white'
  return 'bg-[#D8CFC0] text-[#1D1D1D]'
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative h-full bg-white/70 backdrop-blur-md border-2 border-krishi-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
          {/* Crop Image with Star Overlay */}
          <div className="relative w-full h-48 bg-gradient-to-br from-krishi-bg to-krishi-agriculture overflow-hidden">
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
            {/* Fallback gradient if image fails */}
            <div className="absolute inset-0 bg-gradient-to-br from-krishi-agriculture/80 to-krishi-primary/80 flex items-center justify-center text-5xl font-bold opacity-0 hover:opacity-100 transition-opacity">
              {cropName.charAt(0)}
            </div>

            {/* Star Button Overlay */}
            <motion.button
              onClick={handleStarClick}
              onMouseDown={(e) => e.preventDefault()}
              whileTap={{ scale: 1.15 }}
              whileHover={{ scale: 1.1 }}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:shadow-lg hover:bg-white/95 transition-all duration-200"
              aria-label={isStarred(crop.id) ? 'Remove from My Crops' : 'Add to My Crops'}
              title={isStarred(crop.id) ? 'Remove from My Crops' : 'Add to My Crops'}
            >
              {isStarred(crop.id) ? (
                <AiFillStar size={20} className="text-[#F2A541]" />
              ) : (
                <AiOutlineStar size={20} className="text-gray-400" />
              )}
            </motion.button>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Crop Name */}
            <h3 className="text-xl font-bold text-krishi-indigo mb-2 truncate">
              {cropName}
            </h3>

            {/* Season Badge */}
            <div className="inline-block">
              <span className={`${getSeasonBadgeClass(crop.season_en)} rounded-full px-3 py-1 text-sm font-medium`}>
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
 
