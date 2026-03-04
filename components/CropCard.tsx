'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'

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

// Helper function to get badge color based on season
const getSeasonBadgeClass = (season: string) => {
  if (season === 'Rabi') return 'bg-[#7FB069] text-white'
  if (season === 'Kharif') return 'bg-[#F2A541] text-white'
  if (season === 'Zaid') return 'bg-[#B85C38] text-white'
  if (season === 'Year-round') return 'bg-[#1F3C88] text-white'
  return 'bg-[#D8CFC0] text-[#1D1D1D]'
}

export default function CropCard({ crop }: CropCardProps) {
  const { lang } = useLanguage()
  const cropName = lang === 'hi' ? crop.name_hi : crop.name_en
  const seasonName = lang === 'hi' ? crop.season_hi : crop.season_en

  return (
    <Link href={`/crop-library/${crop.id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="h-full bg-white border-2 border-krishi-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      >
        {/* Crop Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-krishi-bg to-krishi-agriculture overflow-hidden">
          <img
            src={crop.image}
            alt={cropName}
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
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Crop Name */}
          <h3 className="text-xl font-bold text-krishi-heading mb-2 truncate">
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
  )
}
