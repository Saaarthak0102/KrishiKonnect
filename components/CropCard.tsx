'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
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

// Season color mapping - consistent across the app
const SEASON_COLORS: Record<string, string> = {
  'Rabi': '#7FB069',
  'Kharif': '#F2A541',
  'Zaid': '#B85C38',
  'Year-round': '#1F3C88',
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

export default function CropCard({ crop }: CropCardProps) {
  const { lang } = useLanguage()
  const [isStarred, setIsStarred] = useState(false)
  const cropName = lang === 'hi' ? crop.name_hi : crop.name_en
  const seasonName = lang === 'hi' ? crop.season_hi : crop.season_en

  useEffect(() => {
    try {
      const starred = JSON.parse(localStorage.getItem('starredCrops') || '[]')
      setIsStarred(Array.isArray(starred) && starred.includes(crop.id))
    } catch {
      setIsStarred(false)
    }
  }, [crop.id])

  const toggleStar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    let starred: string[] = []

    try {
      const stored = JSON.parse(localStorage.getItem('starredCrops') || '[]')
      starred = Array.isArray(stored) ? stored : []
    } catch {
      starred = []
    }

    if (starred.includes(crop.id)) {
      starred = starred.filter((id) => id !== crop.id)
      setIsStarred(false)
    } else {
      starred.push(crop.id)
      setIsStarred(true)
    }

    localStorage.setItem('starredCrops', JSON.stringify(starred))
  }

  return (
    <Link href={`/crop-library/${crop.id}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="relative h-full bg-white border-2 border-krishi-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      >
        <button
          onClick={toggleStar}
          className="absolute top-3 right-3 text-xl z-10"
          aria-label={isStarred ? 'Unstar crop' : 'Star crop'}
        >
          {isStarred ? '⭐' : '☆'}
        </button>

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

          <p className="mt-3 text-sm font-medium text-krishi-heading">
            {isStarred ? '⭐ Starred' : '☆ Star Crop'}
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
