'use client'

import { useState, useMemo } from 'react'
import Footer from '@/components/Footer'
import CropCard from '@/components/CropCard'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import { translations } from '@/lib/translations'
import cropsData from '@/data/crops.json'

// Season mapping: English to Hindi
const SEASON_MAPPING: Record<string, string> = {
  'Rabi': 'रबी',
  'Kharif': 'खरीफ',
  'Zaid': 'ज़ैद',
  'Year-round': 'पूरे साल',
}

// Season color mapping - consistent with crop cards
const SEASON_COLORS: Record<string, string> = {
  'Rabi': '#7FB069',
  'Kharif': '#F2A541',
  'Zaid': '#B85C38',
  'Year-round': '#1F3C88',
}

// Get filter button styling based on season
const getFilterButtonClass = (season: string, isSelected: boolean): string => {
  if (season === 'all') {
    return isSelected
      ? 'bg-gray-800 text-white shadow-md'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }

  if (season === 'my-crops') {
    return isSelected
      ? 'bg-[#F2A541] text-white shadow-md'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }

  if (isSelected) {
    const color = SEASON_COLORS[season]
    return `text-white shadow-md`
  }

  return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
}

// Get background color style for season buttons
const getFilterBackgroundStyle = (season: string, isSelected: boolean): string => {
  if (season === 'all') {
    return isSelected ? 'bg-gray-800' : 'bg-gray-100'
  }

  if (season === 'my-crops') {
    return isSelected ? 'bg-[#F2A541]' : 'bg-gray-100'
  }

  if (isSelected) {
    const color = SEASON_COLORS[season]
    return `bg-[${color}]`
  }

  return 'bg-gray-100'
}

export default function CropLibraryPage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const { starredCrops } = useStarredCrops()

  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('all')
  const [sortOrder, setSortOrder] = useState('asc')

  // Season options
  const seasons = [
    { value: 'all', label: t.allSeasons },
    { value: 'Rabi', label: t.rabiSeason },
    { value: 'Kharif', label: t.kharifSeason },
    { value: 'Zaid', label: t.zaidSeason },
    { value: 'Year-round', label: t.yearRoundSeason },
  ]

  // Filtering and Sorting Logic
  const filteredAndSortedCrops = useMemo(() => {
    // Helper function to normalize season strings
    const normalizeSeason = (season: string): string => {
      return season.toLowerCase().replace(/\s+/g, '')
    }

    let crops = cropsData ? [...cropsData] : []

    // Step 1: Apply "My Crops" filter first
    if (selectedSeason === 'my-crops') {
      crops = crops.filter((crop) => starredCrops.includes(crop.id))
    } else if (selectedSeason !== 'all') {
      // Step 2: Apply season filter
      crops = crops.filter((crop) => {
        // Get the season value to compare based on current language
        const compareValue = lang === 'hi' ? SEASON_MAPPING[selectedSeason] : selectedSeason
        const cropSeason = lang === 'hi' ? crop.season_hi : crop.season_en
        
        // Normalize both values to handle spaces and case differences
        // This handles multi-season crops like "Kharif / Rabi" or "Kharif/Rabi"
        const normalizedCropSeason = normalizeSeason(cropSeason)
        const normalizedCompareValue = normalizeSeason(compareValue)
        
        return normalizedCropSeason.includes(normalizedCompareValue)
      })
    }

    // Step 3: Apply search filter (case insensitive)
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      crops = crops.filter((crop) => {
        const nameEn = crop.name_en.toLowerCase()
        const nameHi = crop.name_hi.toLowerCase()
        return nameEn.includes(lowerSearchTerm) || nameHi.includes(lowerSearchTerm)
      })
    }

    // Step 4: Apply sorting
    crops.sort((a, b) => {
      const nameA = lang === 'hi' ? a.name_hi : a.name_en
      const nameB = lang === 'hi' ? b.name_hi : b.name_en

      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB, lang === 'hi' ? 'hi' : 'en')
      } else {
        return nameB.localeCompare(nameA, lang === 'hi' ? 'hi' : 'en')
      }
    })

    return crops
  }, [searchTerm, selectedSeason, sortOrder, lang, starredCrops])

  return (
    <FeaturePageLayout>
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {lang === 'hi' ? (
              <>
                <span className="text-[#2D4B8C]">कृषि</span>
                {' '}
                <span className="text-[#C96A3A]">फसल</span>
                {' 🌾'}
              </>
            ) : (
              <>
                <span className="text-[#2D4B8C]">Krishi</span>
                {' '}
                <span className="text-[#C96A3A]">Fasal</span>
                {' 🌾'}
              </>
            )}
          </h1>
          <p className="text-xl text-krishi-text mb-2">{t.cropLibrarySubtitle}</p>
          <p className="text-krishi-text/80 max-w-2xl mx-auto">{t.cropLibraryDescription}</p>
        </motion.div>

        {/* Search and Filters Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
          <div className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-md">
            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary bg-white text-krishi-text placeholder-krishi-text/50"
              />
            </div>

            {/* Season Filter and Sort Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Season Filter Buttons */}
              <div>
                <p className="text-sm font-semibold text-krishi-heading mb-3">
                  {lang === 'hi' ? 'मौसम द्वारा फिल्टर करें' : 'Filter by Season'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((season) => {
                    const isSelected = selectedSeason === season.value
                    let buttonClass = 'px-4 py-2 rounded-full font-semibold transition-all duration-200 '

                    if (season.value === 'all') {
                      buttonClass += isSelected
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } else {
                      const seasonColor = SEASON_COLORS[season.value]
                      if (isSelected) {
                        buttonClass += `text-white shadow-md`
                        buttonClass += ` bg-[${seasonColor}]`
                      } else {
                        buttonClass += 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    }

                    return (
                      <button
                        key={season.value}
                        onClick={() => setSelectedSeason(season.value)}
                        style={isSelected && season.value !== 'all' ? { backgroundColor: SEASON_COLORS[season.value] } : {}}
                        className={buttonClass}
                      >
                        {season.label}
                      </button>
                    )
                  })}
                  {/* My Crops Filter Button */}
                  <button
                    onClick={() => setSelectedSeason('my-crops')}
                    style={selectedSeason === 'my-crops' ? { backgroundColor: '#F2A541' } : {}}
                    className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                      selectedSeason === 'my-crops'
                        ? 'bg-[#F2A541] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ⭐ {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'} ({starredCrops.length})
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div>
                <p className="text-sm font-semibold text-krishi-heading mb-3">
                  {lang === 'hi' ? 'क्रमबद्ध करें' : 'Sort By'}
                </p>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full px-4 py-2 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary bg-white text-krishi-text font-semibold cursor-pointer"
                >
                  <option value="asc">{t.sortAZ}</option>
                  <option value="desc">{t.sortZA}</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Crop Count Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 text-krishi-text/70 text-sm"
        >
          {selectedSeason === 'my-crops' && starredCrops.length === 0 ? (
            <span>{lang === 'hi' ? 'आपने कोई फसल सहेजी नहीं है' : "You haven't saved any crops yet"}</span>
          ) : filteredAndSortedCrops.length === 0 ? (
            <span>{t.noCropsFound}</span>
          ) : (
            <span>
              {lang === 'hi'
                ? `${filteredAndSortedCrops.length} फसलें मिलीं`
                : `Found ${filteredAndSortedCrops.length} crops`}
            </span>
          )}
        </motion.div>

        {/* Crop Grid */}
        {filteredAndSortedCrops.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSortedCrops.map((crop, index) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                layout
              >
                <CropCard crop={crop} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">
              {selectedSeason === 'my-crops' ? '⭐' : '🔍'}
            </div>
            <h3 className="text-2xl font-bold text-krishi-heading mb-2">
              {selectedSeason === 'my-crops'
                ? lang === 'hi'
                  ? 'कोई फसल सहेजी नहीं'
                  : 'No Crops Saved'
                : t.noCropsFound}
            </h3>
            <p className="text-krishi-text/70">
              {selectedSeason === 'my-crops'
                ? lang === 'hi'
                  ? 'अपनी फसल को सहेजने के लिए किसी भी कार्ड पर ⭐ दबाएं'
                  : 'Tap ⭐ on a crop to add it to My Crops'
                : lang === 'hi'
                ? 'अलग सर्च या फिल्टर कोशिश करें'
                : 'Try a different search or filter'}
            </p>
          </motion.div>
        )}
      </main>
      <Footer />
      </div>
    </FeaturePageLayout>
  )
}
