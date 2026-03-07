'use client'

import { useState, useMemo } from 'react'
import Footer from '@/components/Footer'
import CropCard from '@/components/CropCard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import { translations } from '@/lib/translations'
import cropsData from '@/data/crops.json'
import { GiWheat } from 'react-icons/gi'
import { FiSearch, FiStar } from 'react-icons/fi'

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
      ? 'bg-indigo-600 text-white shadow-lg backdrop-blur-md'
      : 'bg-white/40 backdrop-blur-md text-gray-700 hover:bg-white/60 border border-indigo-200/40'
  }

  if (season === 'my-crops') {
    return isSelected
      ? 'bg-[#F2A541] text-white shadow-lg backdrop-blur-md'
      : 'bg-white/40 backdrop-blur-md text-gray-700 hover:bg-white/60 border border-indigo-200/40'
  }

  if (isSelected) {
    const color = SEASON_COLORS[season]
    return `text-white shadow-lg backdrop-blur-md`
  }

  return 'bg-white/40 backdrop-blur-md text-gray-700 hover:bg-white/60 border border-indigo-200/40'
}

// Get background color style for season buttons
const getFilterBackgroundStyle = (season: string, isSelected: boolean): string => {
  if (season === 'all') {
    return isSelected ? 'bg-indigo-600' : 'bg-white/40 backdrop-blur-md'
  }

  if (season === 'my-crops') {
    return isSelected ? 'bg-[#F2A541]' : 'bg-white/40 backdrop-blur-md'
  }

  if (isSelected) {
    const color = SEASON_COLORS[season]
    return `bg-[${color}]`
  }

  return 'bg-white/40 backdrop-blur-md'
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
    <DashboardLayout>
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-[10px] mb-3">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-[#2D2A6E]">
                {lang === 'hi' ? 'कृषि' : 'Krishi'}
              </span>
              {' '}
              <span className="text-[#C46A3D]">
                {lang === 'hi' ? 'फसल' : 'Fasal'}
              </span>
            </h1>
            <GiWheat 
              size={30} 
              color="#2D2A6E" 
              style={{ 
                opacity: 0.9,
                marginLeft: '10px',
                transition: 'all 0.2s ease',
              }}
              className="hover:translate-y-[-1px]"
            />
          </div>
          <p 
            className="text-[1.05rem] font-medium font-[Poppins]"
            style={{ 
              color: '#C46A3D',
              marginTop: '12px',
            }}
          >
            {t.cropLibrarySubtitle}
          </p>
          <p 
            className="text-[0.95rem] leading-relaxed max-w-[680px] mx-auto"
            style={{ 
              color: 'rgba(45,42,110,0.75)', 
              marginTop: '6px',
              lineHeight: '1.6',
            }}
          >
            {t.cropLibraryDescription}
          </p>
        </motion.div>

        {/* Search and Filters Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
          <div 
            className="rounded-[16px] p-[20px_22px] transition-all duration-[250ms] ease-out"
            style={{
              background: 'linear-gradient(rgba(46,157,87,0.05), rgba(196,106,61,0.03)), rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(196,106,61,0.25)',
              borderRadius: '16px',
              boxShadow: '0 10px 28px rgba(0,0,0,0.08), 0 0 12px rgba(45,42,110,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 34px rgba(0,0,0,0.12), 0 0 12px rgba(45,42,110,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.08), 0 0 12px rgba(45,42,110,0.05)';
            }}
          >
            {/* Search Input */}
            <div className="mb-6 flex items-center gap-3" style={{
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(196,106,61,0.35)',
              borderRadius: '10px',
              padding: '12px 14px',
              transition: 'all 0.2s ease',
            }}>
              <FiSearch 
                size={18} 
                color="#2D2A6E" 
                style={{ opacity: 0.75 }}
              />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 focus:outline-none bg-transparent text-[0.95rem] w-full"
                style={{
                  color: '#2D2A6E',
                }}
                onFocus={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.border = '1px solid rgba(196,106,61,0.45)';
                  (e.currentTarget.parentElement as HTMLElement).style.boxShadow = '0 0 0 2px rgba(196,106,61,0.12)';
                }}
                onBlur={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.border = '1px solid rgba(196,106,61,0.35)';
                  (e.currentTarget.parentElement as HTMLElement).style.boxShadow = 'none';
                }}
              />
              <style>{`
                input::placeholder {
                  color: rgba(45,42,110,0.55);
                }
              `}</style>
            </div>

            {/* Season Filter and Sort Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Season Filter Buttons */}
              <div>
                <p 
                  className="text-[0.9rem] font-medium mb-2"
                  style={{ color: '#2D2A6E', marginBottom: '8px' }}
                >
                  {lang === 'hi' ? 'मौसम द्वारा फिल्टर करें' : 'Filter by Season'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((season) => {
                    const isSelected = selectedSeason === season.value
                    
                    // Season-specific styling
                    const getSeasonStyle = () => {
                      if (season.value === 'all') {
                        return isSelected 
                          ? { background: '#2D2A6E', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(45,42,110,0.25)' }
                          : { background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(196,106,61,0.25)', color: 'rgba(45,42,110,0.85)' }
                      }
                      
                      if (isSelected) {
                        return { background: '#2D2A6E', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(45,42,110,0.25)' }
                      }
                      
                      // Season-specific tint styling
                      if (season.value === 'Rabi') {
                        return { background: 'rgba(46,157,87,0.15)', color: '#2E9D57', border: '1px solid rgba(46,157,87,0.25)' }
                      }
                      if (season.value === 'Kharif') {
                        return { background: 'rgba(196,106,61,0.15)', color: '#C46A3D', border: '1px solid rgba(196,106,61,0.25)' }
                      }
                      if (season.value === 'Zaid' || season.value === 'Year-round') {
                        return { background: 'rgba(45,42,110,0.15)', color: '#2D2A6E', border: '1px solid rgba(45,42,110,0.25)' }
                      }
                      
                      return { background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(196,106,61,0.25)', color: 'rgba(45,42,110,0.85)' }
                    }
                    
                    return (
                      <button
                        key={season.value}
                        onClick={() => setSelectedSeason(season.value)}
                        style={getSeasonStyle()}
                        className="px-[14px] py-[6px] rounded-full text-[0.85rem] font-medium transition-all duration-200 ease-out hover:translate-y-[-1px]"
                      >
                        {season.label}
                      </button>
                    )
                  })}
                  {/* My Crops Filter Button */}
                  <button
                    onClick={() => setSelectedSeason('my-crops')}
                    style={
                      selectedSeason === 'my-crops' 
                        ? { background: '#2D2A6E', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(45,42,110,0.25)' }
                        : { background: 'rgba(196,106,61,0.15)', color: '#C46A3D', border: '1px solid rgba(196,106,61,0.25)' }
                    }
                    className="px-[14px] py-[6px] rounded-full text-[0.85rem] font-medium transition-all duration-200 ease-out gap-[6px] inline-flex items-center hover:translate-y-[-1px]"
                  >
                    <FiStar size={16} color={selectedSeason === 'my-crops' ? 'white' : '#C46A3D'} />
                    {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'} ({starredCrops.length})
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div>
                <p 
                  className="text-[0.9rem] font-medium mb-2"
                  style={{ color: '#2D2A6E', marginBottom: '8px' }}
                >
                  {lang === 'hi' ? 'क्रमबद्ध करें' : 'Sort By'}
                </p>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full text-[0.9rem] font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(196,106,61,0.35)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#2D2A6E',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
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
          className="text-sm"
          style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#C46A3D',
            marginBottom: '12px',
            opacity: 0.9,
          }}
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
    </DashboardLayout>
  )
}
