'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [reduceMotion, setReduceMotion] = useState(false)
  const bazaarRevealRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyPreference = () => setReduceMotion(mediaQuery.matches)
    applyPreference()

    mediaQuery.addEventListener('change', applyPreference)

    return () => mediaQuery.removeEventListener('change', applyPreference)
  }, [])

  useEffect(() => {
    if (!bazaarRevealRef.current) {
      return
    }

    const revealElements = Array.from(
      bazaarRevealRef.current.querySelectorAll<HTMLElement>('[data-bazaar-reveal="true"]')
    )

    if (!revealElements.length) {
      return
    }

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      revealElements.forEach((element) => element.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [reduceMotion, selectedCrop, filteredCrops.length, sortedStates.length, expandedMandi])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        <main ref={bazaarRevealRef} className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-3 font-bold tracking-[-0.5px] flex items-center justify-center gap-2"
              style={{ fontSize: '3rem' }}
            >
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
              <motion.span whileHover={{ y: -2, scale: 1.05 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                <MdStorefront size={32} style={{ color: '#2D2A6E', opacity: 0.9, marginLeft: '8px' }} />
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6, ease: 'easeOut' }}
              className="mx-auto max-w-3xl font-medium"
              style={{ fontSize: '1rem', color: '#C46A3D' }}
            >
              {lang === 'hi'
                ? 'अपनी फसल चुनें और सभी मंडियों में सर्वश्रेष्ठ भाव देखें।'
                : 'Select your crop and view the best prices across all mandis.'}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.6, ease: 'easeOut' }}
              className="mx-auto mt-2 max-w-3xl"
              style={{ fontSize: '0.95rem', color: 'rgba(45,42,110,0.75)' }}
            >
              {lang === 'hi'
                ? 'ग्लास-स्टाइल इंटरफेस, ट्रेंड संकेतक, और मंडी-वार तुलना के साथ बेहतर निर्णय लें।'
                : 'Use glass-styled market cards, trend signals, and mandi-wise comparisons for smarter selling decisions.'}
            </motion.p>
          </div>

          {/* Display Mode: Crop Selection or Mandi Details */}
          {!selectedCrop ? (
            // Step 1: Show Crop Selection
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -2,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.14)',
                }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                className="bazaar-reveal mb-8 p-5 transition-all duration-[250ms] ease-out"
                data-bazaar-reveal="true"
                style={{
                  background: 'linear-gradient(rgba(46,157,87,0.05), rgba(196,106,61,0.03)), rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(196,106,61,0.25)',
                  borderRadius: '16px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
                  willChange: 'transform, box-shadow, opacity',
                  transform: 'translateZ(0)',
                }}
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
                      className="w-full rounded-[12px] px-4 py-3 outline-none transition-all duration-[200ms] ease-out will-change-transform"
                      style={{
                        background: 'rgba(255,255,255,0.55)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(196,106,61,0.30)',
                        color: '#2D2A6E',
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid #C46A3D'
                        e.target.style.boxShadow = '0 0 8px rgba(196,106,61,0.18)'
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
                      className="w-full rounded-lg border-2 px-4 py-3 outline-none transition-all duration-[200ms] ease-out hover:bg-[rgba(45,42,110,0.05)]"
                      style={{
                        borderColor: '#D8CFC0',
                        color: '#1F3C88',
                        backgroundColor: 'rgba(255, 255, 255, 0.62)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#C46A3D'
                        e.target.style.border = '2px solid #C46A3D'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D8CFC0'
                        e.target.style.border = ''
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
                      <motion.button
                        onClick={() => setShowMyCrops(!showMyCrops)}
                        className="w-full rounded-[10px] px-6 py-3 font-semibold transition-all duration-[200ms] ease-out active:scale-[0.97]"
                        style={{
                          color: showMyCrops ? '#FFFFFF' : '#2D2A6E',
                          backgroundColor: showMyCrops ? '#C46A3D' : 'rgba(196,106,61,0.12)',
                          border: showMyCrops ? '1px solid #C46A3D' : '1px solid rgba(196,106,61,0.35)',
                        }}
                        whileHover={{
                          scale: 1.03,
                          y: -2,
                          backgroundColor: showMyCrops ? '#B95D31' : '#242159',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 20px rgba(45,42,110,0.24)',
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        ⭐ {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'} ({starredCrops.length})
                      </motion.button>
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
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{
                        y: -4,
                        scale: 1.01,
                        boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.16)',
                        borderColor: 'rgba(196,106,61,0.35)',
                        transition: { duration: 0.12, ease: 'easeOut' },
                      }}
                      whileTap={{ scale: 0.97, transition: { duration: 0.08, ease: 'easeOut' } }}
                      transition={{ delay: 0.05 + idx * 0.05, duration: 0.5, ease: 'easeOut' }}
                      onClick={() => setSelectedCrop(crop.name_en)}
                      className="crop-card bazaar-reveal group rounded-[16px] p-5 text-left"
                      data-bazaar-reveal="true"
                      style={{
                        background: 'rgba(255,255,255,0.55)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(196,106,61,0.30)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
                        transform: 'translateZ(0)',
                        willChange: 'transform, box-shadow, opacity',
                        transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                              <motion.span whileHover={{ y: -2, scale: 1.05 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                                <CropIcon
                                  size={20}
                                  style={{ color: '#2D2A6E', opacity: 0.85 }}
                                />
                              </motion.span>
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
                            <motion.p
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, ease: 'easeOut', delay: idx * 0.05 + 0.1 }}
                              className="font-semibold badge-glow rounded-full px-3 py-1"
                              style={{ fontSize: '1.35rem', color: '#2E9D57' }}
                            >
                              ₹{bestPrice.toLocaleString('en-IN')}
                            </motion.p>
                            {trendDirection === 'up' && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -2, scale: 1.05 }}
                                transition={{ duration: 0.25, ease: 'easeOut', delay: idx * 0.05 + 0.16 }}
                              >
                                <FiTrendingUp size={18} style={{ color: '#2E9D57' }} aria-label="Price trending up" />
                              </motion.span>
                            )}
                            {trendDirection === 'down' && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -2, scale: 1.05 }}
                                transition={{ duration: 0.25, ease: 'easeOut', delay: idx * 0.05 + 0.16 }}
                              >
                                <FiTrendingDown size={18} style={{ color: '#C46A3D' }} aria-label="Price trending down" />
                              </motion.span>
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
                      <motion.div
                        whileHover={{ scale: 1.03, y: -2, backgroundColor: '#242159', color: '#FFFFFF', boxShadow: '0 10px 20px rgba(45,42,110,0.24)' }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="view-prices-button mt-4 inline-flex cursor-pointer items-center rounded-[10px] border px-[14px] py-2 font-medium"
                        style={{
                          background: 'rgba(45,42,110,0.08)',
                          color: '#2D2A6E',
                          borderColor: 'rgba(45,42,110,0.25)',
                        }}
                      >
                        {lang === 'hi' ? 'भाव देखें' : 'View Prices'}
                        <span className="ml-2">→</span>
                      </motion.div>
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
                  className="inline-flex items-center gap-2 font-medium text-[#2D2A6E] transition-all duration-[250ms] ease-out transform hover:translate-x-[-2px] hover:scale-[1.02] hover:text-[#C46A3D] active:scale-[0.97]"
                >
                  <span>←</span>
                  <span>{lang === 'hi' ? 'वापस' : 'Back'}</span>
                </button>
                <h2 className="text-3xl font-bold" style={{ color: '#1F3C88' }}>
                  {selectedCrop} {lang === 'hi' ? 'भाव' : 'Prices'}
                </h2>
              </motion.div>

              {/* Search and Filter Section */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -2,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.14)',
                }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                className="bazaar-reveal mb-8 p-5"
                data-bazaar-reveal="true"
                style={{
                  background: 'linear-gradient(rgba(46,157,87,0.05), rgba(196,106,61,0.03)), rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(196,106,61,0.25)',
                  borderRadius: '16px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
                }}
              >
                <div className="flex items-end justify-between gap-4">
                  {/* State Filter Dropdown */}
                  <div className="flex flex-1 flex-col gap-[6px]">
                    <label className="block text-sm font-semibold" style={{ color: '#1F3C88' }}>
                      {lang === 'hi' ? 'राज्य' : 'State'}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="h-[42px] w-full rounded-lg border-2 px-4 py-2 outline-none transition-all duration-[200ms] ease-out hover:bg-[rgba(45,42,110,0.05)]"
                      style={{
                        borderColor: '#D8CFC0',
                        color: '#1F3C88',
                        backgroundColor: 'rgba(255, 255, 255, 0.62)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#C46A3D'
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
                      <motion.button
                        onClick={() => {
                          setSelectedCrop(null)
                          setShowMyCrops(true)
                          setSelectedState('')
                        }}
                        className="h-[42px] rounded-[12px] px-4 font-semibold transition-all"
                        style={{
                          color: '#2D2A6E',
                          backgroundColor: 'rgba(196,106,61,0.12)',
                          border: '1px solid rgba(196,106,61,0.35)',
                        }}
                        whileHover={{ scale: 1.03, y: -2, backgroundColor: '#242159', color: '#FFFFFF', boxShadow: '0 10px 20px rgba(45,42,110,0.24)' }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        ⭐ {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'} ({starredCrops.length})
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + 0 * 0.05, duration: 0.5, ease: 'easeOut' }}
                  className="bazaar-reveal h-full"
                  data-bazaar-reveal="true"
                >
                  <MandiBestPriceCard bestMandi={bestMandiForSelectedCrop} lang={lang} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + 1 * 0.05, duration: 0.5, ease: 'easeOut' }}
                  className="bazaar-reveal h-full"
                  data-bazaar-reveal="true"
                >
                  <MandiPriceSummary
                    selectedCrop={selectedCrop}
                    lang={lang}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + 2 * 0.05, duration: 0.5, ease: 'easeOut' }}
                  className="bazaar-reveal h-full"
                  data-bazaar-reveal="true"
                >
                  <NearbyMandisCard
                    userState={farmerProfile?.state || (lang === 'hi' ? 'आपका राज्य' : 'Your State')}
                    mandis={nearbyMandis}
                    lang={lang}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + 3 * 0.05, duration: 0.5, ease: 'easeOut' }}
                  className="bazaar-reveal h-full"
                  data-bazaar-reveal="true"
                >
                  <WeeklyMarketTrend
                    direction={weeklyDirection.direction}
                    label={weeklyDirection.label}
                    averageChange={weeklyDirection.averageChange}
                    lang={lang}
                  />
                </motion.div>
              </div>

              {/* States with Mandis */}
              <div className="space-y-8">
                {sortedStates.map((state, stateIdx) => (
                  <motion.section
                    key={state}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stateIdx * 0.05, duration: 0.3 }}
                    className="bazaar-reveal"
                    data-bazaar-reveal="true"
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
                          className="bazaar-reveal"
                          data-bazaar-reveal="true"
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
