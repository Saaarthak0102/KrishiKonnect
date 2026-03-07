'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconType } from 'react-icons'
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi'
import { GiCottonFlower, GiPlantSeed, GiWheat } from 'react-icons/gi'
import { MdStorefront } from 'react-icons/md'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/LanguageContext'
import { useMandiPrices } from '@/lib/MandiContext'
import { useAuth } from '@/context/AuthContext'
import { MandiPrice, getBestMandiForCrop } from '@/lib/mandiService'
import { calculateWeeklyDirection } from '@/lib/trendUtils'
import MandiPriceCard from '@/components/MandiPriceCard'
import MandiTrendChart from '@/components/MandiTrendChart'
import MandiBestPriceCard from '@/components/MandiBestPriceCard'
import MandiPriceSummary from '@/components/MandiPriceSummary'
import NearbyMandisCard from '@/components/NearbyMandisCard'
import WeeklyMarketTrend from '@/components/WeeklyMarketTrend'
import { useStarredCrops } from '@/lib/useStarredCrops'
import cropsData from '@/data/crops.json'

interface ContextMandiPrice {
  id: string
  crop: string
  state: string
  mandi: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  trend: {
    direction: 'up' | 'down' | 'stable'
    change: string
  }
  lastUpdated: string
}

interface GroupedByState {
  [state: string]: MandiPrice[]
}

function getCropIcon(cropName: string): IconType {
  const normalizedName = cropName.toLowerCase()

  if (normalizedName.includes('cotton')) return GiCottonFlower
  if (normalizedName.includes('barley') || normalizedName.includes('wheat')) return GiWheat
  if (normalizedName.includes('chickpea') || normalizedName.includes('chana')) return GiPlantSeed

  return GiPlantSeed
}

function convertToComponentPrice(data: ContextMandiPrice, cropHi: string): MandiPrice {
  return {
    id: data.id,
    crop: data.crop,
    cropEn: data.crop,
    cropHi: cropHi,
    mandi: data.mandi,
    mandiEn: data.mandi,
    mandiHi: data.mandi,
    district: data.state,
    state: data.state,
    minPrice: data.minPrice,
    maxPrice: data.maxPrice,
    modalPrice: data.modalPrice,
    trend: data.trend.direction,
    unit: 'per quintal',
    source: 'Cached Dataset',
    date: new Date().toISOString().slice(0, 10),
  }
}

export default function MandiPage() {
  const { lang } = useLanguage()
  const { farmerProfile } = useAuth()
  const { prices: cachedPrices, loading } = useMandiPrices()
  const searchParams = useSearchParams()
  const cropIdFromParam = searchParams.get('crop')
  const { starredCrops } = useStarredCrops()

  // Get crop name from ID when navigated from crop detail page
  const initialCropName = useMemo(() => {
    if (!cropIdFromParam) return null
    const crop = cropsData.find((c) => c.id === cropIdFromParam)
    return crop ? crop.name_en : null
  }, [cropIdFromParam])
  
  const [selectedCrop, setSelectedCrop] = useState<string | null>(initialCropName)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [showMyCrops, setShowMyCrops] = useState(false)
  const [expandedMandi, setExpandedMandi] = useState<string | null>(null)
  const [shouldScroll, setShouldScroll] = useState(!!initialCropName)

  const componentPrices = useMemo(() => {
    if (!cachedPrices.length) return []

    const cropNameHiByEn = new Map(cropsData.map((crop) => [crop.name_en, crop.name_hi]))

    return (cachedPrices as ContextMandiPrice[]).map((price) => {
      const cropHi = cropNameHiByEn.get(price.crop) || price.crop
      return convertToComponentPrice(price, cropHi)
    })
  }, [cachedPrices])

  const cropPriceStats = useMemo(() => {
    const stats: Record<string, { mandiCount: number; bestPrice: number; trendScore: number }> = {}

    for (const price of componentPrices) {
      const key = price.cropEn
      if (!stats[key]) {
        stats[key] = {
          mandiCount: 0,
          bestPrice: 0,
          trendScore: 0,
        }
      }

      stats[key].mandiCount += 1
      if (price.modalPrice > stats[key].bestPrice) {
        stats[key].bestPrice = price.modalPrice
      }

      if (price.trend === 'up') stats[key].trendScore += 1
      if (price.trend === 'down') stats[key].trendScore -= 1
    }

    return Object.fromEntries(
      Object.entries(stats).map(([cropName, value]) => {
        const trendDirection =
          value.trendScore > 0 ? 'up' : value.trendScore < 0 ? 'down' : 'stable'

        return [
          cropName,
          {
            mandiCount: value.mandiCount,
            bestPrice: value.bestPrice,
            trendDirection,
          },
        ]
      })
    ) as Record<string, { mandiCount: number; bestPrice: number; trendDirection: 'up' | 'down' | 'stable' }>
  }, [componentPrices])

  // Handle auto-scroll and highlight when crop is navigated from detail page
  useEffect(() => {
    if (shouldScroll && selectedCrop) {
      // Add a small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        const cropElement = document.getElementById(`crop-card-${selectedCrop.toLowerCase().replace(/\s+/g, '-')}`)
        if (cropElement) {
          cropElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Highlight the card temporarily
          cropElement.classList.add('highlighted-crop-card')
          setTimeout(() => {
            cropElement.classList.remove('highlighted-crop-card')
          }, 3000) // Remove highlight after 3 seconds
        }
        setShouldScroll(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [shouldScroll, selectedCrop])
  const filteredCrops = useMemo(() => {
    let crops = cropsData

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      crops = crops.filter(
        (crop) =>
          crop.name_en.toLowerCase().includes(term) ||
          crop.name_hi.toLowerCase().includes(term)
      )
    }

    // Filter by state - show only crops that have mandi data in selected state
    if (selectedState) {
      const cropsInState = new Set(
        componentPrices
          .filter((p) => p.state === selectedState)
          .map((p) => p.cropEn)
      )
      crops = crops.filter((crop) => cropsInState.has(crop.name_en))
    }

    // Filter by "My Crops" - show only starred crops
    if (showMyCrops) {
      crops = crops.filter((crop) => starredCrops.includes(crop.id))
    }

    return crops.sort((a, b) => a.name_en.localeCompare(b.name_en))
  }, [searchTerm, showMyCrops, starredCrops, selectedState, componentPrices])

  // Get mandis for selected crop grouped by state, filtered by selectedState
  const mandisGroupedByState = useMemo((): GroupedByState => {
    if (!selectedCrop) return {}

    let filtered = componentPrices.filter((p) => p.cropEn === selectedCrop)

    // Apply state filter
    if (selectedState) {
      filtered = filtered.filter((p) => p.state === selectedState)
    }

    const grouped: GroupedByState = {}

    filtered.forEach((price) => {
      if (!grouped[price.state]) {
        grouped[price.state] = []
      }
      grouped[price.state].push(price)
    })

    return grouped
  }, [selectedCrop, componentPrices, selectedState])

  // Get all available states for selected crop
  const availableStates = useMemo(() => {
    if (!selectedCrop) return []
    const states = componentPrices
      .filter((p) => p.cropEn === selectedCrop)
      .map((p) => p.state)
    return [...new Set(states)].sort()
  }, [selectedCrop, componentPrices])

  // Get all states from all mandi data (for crop selection filter)
  const allStates = useMemo(() => {
    const states = componentPrices.map((p) => p.state)
    return [...new Set(states)].sort()
  }, [componentPrices])

  // Sort states for display
  const sortedStates = useMemo(() => {
    return Object.keys(mandisGroupedByState).sort()
  }, [mandisGroupedByState])

  const selectedCropPrices = useMemo(() => {
    if (!selectedCrop) return []
    return componentPrices.filter((p) => p.cropEn === selectedCrop)
  }, [selectedCrop, componentPrices])

  const bestMandiForSelectedCrop = useMemo(() => {
    if (!selectedCrop) return null
    return getBestMandiForCrop(selectedCrop, componentPrices)
  }, [selectedCrop, componentPrices])

  const priceSummary = useMemo(() => {
    if (!selectedCropPrices.length) {
      return {
        bestPrice: 0,
        lowestPrice: 0,
        averagePrice: 0,
        mandiCount: 0,
      }
    }

    const modalPrices = selectedCropPrices.map((p) => p.modalPrice)
    const total = modalPrices.reduce((acc, value) => acc + value, 0)

    return {
      bestPrice: Math.max(...modalPrices),
      lowestPrice: Math.min(...modalPrices),
      averagePrice: Math.round(total / modalPrices.length),
      mandiCount: selectedCropPrices.length,
    }
  }, [selectedCropPrices])

  const nearbyMandis = useMemo(() => {
    const userState = farmerProfile?.state
    if (!userState || !selectedCropPrices.length) return []

    return selectedCropPrices
      .filter((price) => price.state === userState)
      .slice()
      .sort((a, b) => b.modalPrice - a.modalPrice)
      .slice(0, 3)
  }, [farmerProfile?.state, selectedCropPrices])

  const weeklyHistory = useMemo(() => {
    return selectedCropPrices
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, 7)
      .map((item, index) => ({
        date: `D${index + 1}`,
        modalPrice: item.modalPrice,
      }))
  }, [selectedCropPrices])

  const weeklyDirection = useMemo(() => {
    return calculateWeeklyDirection(weeklyHistory)
  }, [weeklyHistory])

  const handleToggleTrend = useCallback((mandiId: string) => {
    setExpandedMandi((prev) => (prev === mandiId ? null : mandiId))
  }, [])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        <main className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <h1 className="mb-3 font-bold tracking-[-0.5px] flex items-center justify-center gap-2" style={{ fontSize: '3rem' }}>
              {lang === 'hi' ? (
                <>
                  <span className="text-[#2D2A6E]">कृषि</span>
                  {' '}
                  <span className="text-[#C46A3D]">बाजार</span>
                </>
              ) : (
                <>
                  <span className="text-[#2D2A6E]">Krishi</span>
                  {' '}
                  <span className="text-[#C46A3D]">Bazaar</span>
                </>
              )}
              <MdStorefront size={32} style={{ color: '#2D2A6E', opacity: 0.9, marginLeft: '8px' }} />
            </h1>
            <p className="mx-auto max-w-3xl font-medium" style={{ fontSize: '1rem', color: '#C46A3D' }}>
              {lang === 'hi'
                ? 'अपनी फसल चुनें और सभी मंडियों में सर्वश्रेष्ठ भाव देखें।'
                : 'Select your crop and view the best prices across all mandis.'}
            </p>
          </motion.div>

          {/* Display Mode: Crop Selection or Mandi Details */}
          {!selectedCrop ? (
            // Step 1: Show Crop Selection
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="mb-8 rounded-xl border-2 bg-white/60 p-5 backdrop-blur-md"
                style={{ borderColor: '#E8DCC8' }}
              >
                {/* Search & Filter Container */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
                  {/* Crop Search Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={lang === 'hi' ? 'फसल खोजें... जैसे गेहूं, चावल' : 'Search crops... e.g. Wheat, Rice'}
                      className="w-full rounded-[12px] px-4 py-3 outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.55)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(196,106,61,0.30)',
                        color: '#2D2A6E',
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid #C46A3D'
                        e.target.style.boxShadow = '0 0 10px rgba(196,106,61,0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(196,106,61,0.30)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* State Filter Dropdown */}
                  <div className="w-full md:w-48">
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full rounded-lg border-2 px-4 py-3 outline-none transition-colors"
                      style={{
                        borderColor: '#D8CFC0',
                        color: '#1F3C88',
                        backgroundColor: 'rgba(255, 255, 255, 0.62)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1F3C88'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D8CFC0'
                      }}
                    >
                      <option value="">
                        {lang === 'hi' ? 'सभी राज्य' : 'All States'}
                      </option>
                      {allStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* My Crops Filter Button */}
                  {starredCrops.length > 0 && (
                    <div className="w-full md:w-auto">
                      <button
                        onClick={() => setShowMyCrops(!showMyCrops)}
                        className="w-full rounded-[10px] px-6 py-3 font-semibold transition-all"
                        style={{
                          color: showMyCrops ? '#FFFFFF' : '#2D2A6E',
                          backgroundColor: showMyCrops ? '#C46A3D' : 'rgba(196,106,61,0.12)',
                          border: showMyCrops ? '1px solid #C46A3D' : '1px solid rgba(196,106,61,0.35)',
                        }}
                        onMouseEnter={(e) => {
                          if (showMyCrops) {
                            e.currentTarget.style.backgroundColor = '#B95D31'
                          } else {
                            e.currentTarget.style.backgroundColor = '#C46A3D'
                            e.currentTarget.style.color = '#FFFFFF'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (showMyCrops) {
                            e.currentTarget.style.backgroundColor = '#C46A3D'
                          } else {
                            e.currentTarget.style.backgroundColor = 'rgba(196,106,61,0.12)'
                            e.currentTarget.style.color = '#2D2A6E'
                          }
                        }}
                      >
                        ⭐ {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'} ({starredCrops.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* Active Filters Display */}
                {(showMyCrops || selectedState) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex flex-wrap items-center gap-2"
                  >
                    <span className="text-sm font-semibold" style={{ color: '#1F3C88' }}>
                      {lang === 'hi' ? 'सक्रिय फ़िल्टर:' : 'Active Filters:'}
                    </span>
                    {showMyCrops && (
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: 'rgba(242, 165, 65, 0.2)', color: '#F2A541' }}
                      >
                        {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'}
                        <button
                          onClick={() => setShowMyCrops(false)}
                          className="hover:opacity-70"
                          style={{ color: '#F2A541' }}
                        >
                          ✕
                        </button>
                      </span>
                    )}
                    {selectedState && (
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: 'rgba(31, 60, 136, 0.15)', color: '#1F3C88' }}
                      >
                        {selectedState}
                        <button
                          onClick={() => setSelectedState('')}
                          className="hover:opacity-70"
                          style={{ color: '#1F3C88' }}
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Crop Cards Grid */}
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCrops.map((crop, idx) => {
                  const cropStats = cropPriceStats[crop.name_en]
                  const bestPrice = cropStats?.bestPrice || 0
                  const mandiCount = cropStats?.mandiCount || 0
                  const trendDirection = cropStats?.trendDirection || 'stable'
                  const CropIcon = getCropIcon(crop.name_en)

                  return (
                    <motion.button
                      key={crop.id}
                      id={`crop-card-${crop.name_en.toLowerCase().replace(/\s+/g, '-')}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{
                        y: -4,
                        boxShadow: '0 14px 35px rgba(0,0,0,0.12), 0 0 18px rgba(45,42,110,0.12)',
                      }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3), duration: 0.25, ease: 'easeOut' }}
                      onClick={() => setSelectedCrop(crop.name_en)}
                      className="group rounded-[16px] p-5 text-left transition-all duration-[250ms] ease-in-out"
                      style={{
                        background: 'rgba(255,255,255,0.55)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(196,106,61,0.30)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 0 14px rgba(45,42,110,0.08)',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <CropIcon size={20} style={{ color: '#2D2A6E', opacity: 0.85 }} />
                            <h3
                              className="font-semibold flex items-center"
                              style={{ fontSize: '1.2rem', color: '#2D2A6E' }}
                            >
                              {lang === 'hi' ? crop.name_hi : crop.name_en}
                            </h3>
                          </div>
                          <p className="font-medium mb-3" style={{ fontSize: '0.9rem', color: '#C46A3D' }}>
                            {mandiCount} {lang === 'hi' ? 'मंडियां' : 'mandis'}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold" style={{ fontSize: '1.35rem', color: '#2E9D57' }}>
                              ₹{bestPrice.toLocaleString('en-IN')}
                            </p>
                            {trendDirection === 'up' && (
                              <FiTrendingUp size={18} style={{ color: '#2E9D57' }} aria-label="Price trending up" />
                            )}
                            {trendDirection === 'down' && (
                              <FiTrendingDown size={18} style={{ color: '#C46A3D' }} aria-label="Price trending down" />
                            )}
                          </div>
                          <p
                            className="font-medium"
                            style={{ fontSize: '0.85rem', color: '#C46A3D' }}
                          >
                            {lang === 'hi' ? 'सर्वोत्तम भाव' : 'best price'}
                          </p>
                        </div>
                      </div>
                      <div
                        className="mt-4 inline-flex cursor-pointer items-center rounded-[10px] border px-[14px] py-2 font-medium transition-all group-hover:bg-[#2D2A6E] group-hover:text-white"
                        style={{
                          background: 'rgba(45,42,110,0.08)',
                          color: '#2D2A6E',
                          borderColor: 'rgba(45,42,110,0.25)',
                        }}
                      >
                        {lang === 'hi' ? 'भाव देखें' : 'View Prices'}
                        <span className="ml-2">→</span>
                      </div>
                    </motion.button>
                  )
                })}
              </section>
            </>
          ) : (
            // Step 2: Show Mandis Grouped by State
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back Button and Crop Title */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center gap-4"
              >
                <button
                  onClick={() => {
                    setSelectedCrop(null)
                    setExpandedMandi(null)
                    setSelectedState('')
                  }}
                  className="px-4 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    color: '#1F3C88',
                    backgroundColor: '#E8DCC8',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D4C4A8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E8DCC8'
                  }}
                >
                  ← {lang === 'hi' ? 'वापस' : 'Back'}
                </button>
                <h2 className="text-3xl font-bold" style={{ color: '#1F3C88' }}>
                  {selectedCrop} {lang === 'hi' ? 'भाव' : 'Prices'}
                </h2>
              </motion.div>

              {/* Search and Filter Section */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-8 rounded-xl border-2 bg-white/60 p-5 backdrop-blur-md"
                style={{ borderColor: '#E8DCC8' }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
                  {/* State Filter Dropdown */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
                      {lang === 'hi' ? 'राज्य' : 'State'}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full rounded-lg border-2 px-4 py-2 outline-none transition-colors"
                      style={{
                        borderColor: '#D8CFC0',
                        color: '#1F3C88',
                        backgroundColor: 'rgba(255, 255, 255, 0.62)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1F3C88'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D8CFC0'
                      }}
                    >
                      <option value="">
                        {lang === 'hi' ? 'सभी राज्य' : 'All States'}
                      </option>
                      {availableStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* My Crops Button */}
                  {starredCrops.length > 0 && (
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSelectedCrop(null)
                          setShowMyCrops(true)
                          setSelectedState('')
                        }}
                        className="w-full rounded-[10px] px-6 py-2 font-semibold transition-all md:w-auto"
                        style={{
                          color: '#2D2A6E',
                          backgroundColor: 'rgba(196,106,61,0.12)',
                          border: '1px solid rgba(196,106,61,0.35)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#C46A3D'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(196,106,61,0.12)'
                          e.currentTarget.style.color = '#2D2A6E'
                        }}
                      >
                        ⭐ {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'} ({starredCrops.length})
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <MandiBestPriceCard bestMandi={bestMandiForSelectedCrop} lang={lang} />
                <MandiPriceSummary
                  bestPrice={priceSummary.bestPrice}
                  averagePrice={priceSummary.averagePrice}
                  lowestPrice={priceSummary.lowestPrice}
                  mandiCount={priceSummary.mandiCount}
                  lang={lang}
                />
                <NearbyMandisCard
                  userState={farmerProfile?.state || (lang === 'hi' ? 'आपका राज्य' : 'Your State')}
                  mandis={nearbyMandis}
                  lang={lang}
                />
                <WeeklyMarketTrend
                  direction={weeklyDirection.direction}
                  label={weeklyDirection.label}
                  averageChange={weeklyDirection.averageChange}
                  lang={lang}
                />
              </div>

              {/* States with Mandis */}
              <div className="space-y-8">
                {sortedStates.map((state, stateIdx) => (
                  <motion.section
                    key={state}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stateIdx * 0.05, duration: 0.3 }}
                  >
                    <h3
                      className="text-2xl font-bold mb-5 pb-3 border-b-2"
                      style={{ color: '#1F3C88', borderColor: '#E8DCC8' }}
                    >
                      {state}
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                      {mandisGroupedByState[state].map((mandi, idx) => (
                        <motion.div
                          key={mandi.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.02, duration: 0.2 }}
                        >
                          <MandiPriceCard
                            price={mandi}
                            onViewTrend={handleToggleTrend}
                          />
                          {expandedMandi === mandi.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3"
                            >
                              <MandiTrendChart
                                crop={selectedCrop}
                                mandi={mandi.mandiEn}
                                data={weeklyHistory}
                                trend={mandi.trend}
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </DashboardLayout>
  )
  
}
