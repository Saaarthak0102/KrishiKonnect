'use client'

import { useState, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CropCard from '@/components/CropCard'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import cropsData from '@/data/crops.json'

export default function CropLibraryPage() {
  const { lang } = useLanguage()
  const t = translations[lang]

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
    let crops = [...cropsData]

    // Step 1: Apply season filter
    if (selectedSeason !== 'all') {
      crops = crops.filter((crop) => {
        const cropSeason = lang === 'hi' ? crop.season_hi : crop.season_en
        const selectedSeasonLabel = lang === 'hi' 
          ? t[selectedSeason.toLowerCase() + 'Season'] 
          : seasons.find(s => s.value === selectedSeason)?.label
        return cropSeason === selectedSeason
      })
    }

    // Step 2: Apply search filter (case insensitive)
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      crops = crops.filter((crop) => {
        const nameEn = crop.name_en.toLowerCase()
        const nameHi = crop.name_hi.toLowerCase()
        return nameEn.includes(lowerSearchTerm) || nameHi.includes(lowerSearchTerm)
      })
    }

    // Step 3: Apply sorting
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
  }, [searchTerm, selectedSeason, sortOrder, lang])

  return (
    <div className="min-h-screen bg-krishi-bg">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-krishi-heading mb-4">
            {t.cropLibraryTitle}
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
                  {seasons.map((season) => (
                    <button
                      key={season.value}
                      onClick={() => setSelectedSeason(season.value)}
                      className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                        selectedSeason === season.value
                          ? 'bg-krishi-primary text-white shadow-md'
                          : 'bg-krishi-border text-krishi-heading hover:bg-krishi-agriculture/20'
                      }`}
                    >
                      {season.label}
                    </button>
                  ))}
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
          {filteredAndSortedCrops.length === 0 ? (
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
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-krishi-heading mb-2">
              {t.noCropsFound}
            </h3>
            <p className="text-krishi-text/70">
              {lang === 'hi'
                ? 'अलग सर्च या फिल्टर कोशिश करें'
                : 'Try a different search or filter'}
            </p>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  )
}
