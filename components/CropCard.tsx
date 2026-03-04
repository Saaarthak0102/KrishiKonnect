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
            <span className="inline-block bg-krishi-highlight text-white px-3 py-1 rounded-full text-sm font-semibold">
              {seasonName}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
