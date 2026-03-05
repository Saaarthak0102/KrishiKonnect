'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/LanguageContext'
import { MandiPrice } from '@/lib/mandiService'
import MandiPriceCard from '@/components/MandiPriceCard'
import MandiTrendChart from '@/components/MandiTrendChart'
import { useStarredCrops } from '@/lib/useStarredCrops'
import cropsData from '@/data/crops.json'
import mandiPricesData from '@/data/mandiPrices.json'

// Original mock data interface
interface MandiPriceData {
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

// Helper to convert mock data to component interface
function convertToComponentPrice(data: MandiPriceData, cropHi: string): any {
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
    source: 'Mock Dataset',
    date: new Date().toISOString(),
  }
}

export default function MandiPage() {
  const { lang } = useLanguage()
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
  const [prices, setPrices] = useState<MandiPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedMandi, setExpandedMandi] = useState<string | null>(null)
  const [shouldScroll, setShouldScroll] = useState(!!initialCropName)

  // Load and process prices with mock live updates
  useEffect(() => {
    const loadPrices = () => {
      // Apply mock live price updates (±2%) to simulate real market data
      const updatedPrices = (mandiPricesData.prices as MandiPriceData[])
        .map((priceData) => {
          const variation = Math.random() * 0.04 - 0.02 // ±2%
          const newModalPrice = Math.round(priceData.modalPrice * (1 + variation))
          const newMinPrice = Math.round(priceData.minPrice * (1 + variation))
          const newMaxPrice = Math.round(priceData.maxPrice * (1 + variation))

          // Recalculate trend based on new price variation
          let trend: 'up' | 'down' | 'stable' = 'stable'

          if (variation > 0.01) {
            trend = 'up'
          } else if (variation < -0.01) {
            trend = 'down'
          }

          const updated: MandiPriceData = {
            ...priceData,
            modalPrice: newModalPrice,
            minPrice: newMinPrice,
            maxPrice: newMaxPrice,
            trend: { ...priceData.trend, direction: trend },
          }

          // Find crop Hindi name
          const crop = cropsData.find((c) => c.name_en === priceData.crop)
          const cropHi = crop ? crop.name_hi : priceData.crop

          return convertToComponentPrice(updated, cropHi)
        })

      setPrices(updatedPrices)
      setLoading(false)
    }

    loadPrices()
  }, [])

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

    // Filter by "My Crops" - show only starred crops
    if (showMyCrops) {
      crops = crops.filter((crop) => starredCrops.includes(crop.id))
    }

    return crops.sort((a, b) => a.name_en.localeCompare(b.name_en))
  }, [searchTerm, showMyCrops, starredCrops])

  // Get mandis for selected crop grouped by state, filtered by selectedState
  const mandisGroupedByState = useMemo((): GroupedByState => {
    if (!selectedCrop) return {}

    let filtered = prices.filter((p) => p.cropEn === selectedCrop)
    
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
  }, [selectedCrop, prices, selectedState])

  // Get all available states for selected crop
  const availableStates = useMemo(() => {
    if (!selectedCrop) return []
    const states = prices
      .filter((p) => p.cropEn === selectedCrop)
      .map((p) => p.state)
    return [...new Set(states)].sort()
  }, [selectedCrop, prices])

  // Sort states for display
  const sortedStates = useMemo(() => {
    return Object.keys(mandisGroupedByState).sort()
  }, [mandisGroupedByState])

  // Get crop by ID
  const getCropName = (cropId: string): string => {
    const crop = cropsData.find((c) => c.id === cropId)
    return crop ? (lang === 'hi' ? crop.name_hi : crop.name_en) : cropId
  }

  return (
    <FeaturePageLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#F9F6F0' }}>
        <main className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <h1 className="mb-3 text-4xl font-bold md:text-5xl" style={{ color: '#1F3C88' }}>
              {lang === 'hi' ? 'मंडी भाव' : 'Mandi Prices'}
            </h1>
            <p className="mx-auto max-w-3xl text-gray-700">
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
                className="mb-8 rounded-xl border-2 p-5"
                style={{ borderColor: '#E8DCC8', backgroundColor: '#FAF3E0' }}
              >
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={lang === 'hi' ? 'फसल खोजें... जैसे गेहूं, चावल' : 'Search crops... e.g. Wheat, Rice'}
                    className="w-full rounded-lg border-2 px-4 py-3 outline-none transition-colors"
                    style={{
                      borderColor: '#D8CFC0',
                      color: '#1F3C88',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1F3C88'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D8CFC0'
                    }}
                  />
                  
                  {/* Reset My Crops Filter Button */}
                  {showMyCrops && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 rounded-lg p-3"
                      style={{ backgroundColor: 'rgba(242, 165, 65, 0.1)' }}
                    >
                      <span style={{ color: '#F2A541', fontWeight: 'bold' }}>
                        {lang === 'hi' ? 'मेरी फसलें दिखा रहे हैं' : 'Showing My Crops'}
                      </span>
                      <button
                        onClick={() => setShowMyCrops(false)}
                        className="ml-auto px-3 py-1 rounded-lg font-semibold text-sm transition-all"
                        style={{
                          color: '#FFFFFF',
                          backgroundColor: '#F2A541',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E89B2E'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F2A541'
                        }}
                      >
                        {lang === 'hi' ? 'साफ करें' : 'Clear'}
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* My Crops Quick Filter Button */}
              {starredCrops.length > 0 && !showMyCrops && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="mb-8 flex justify-center"
                >
                  <button
                    onClick={() => setShowMyCrops(true)}
                    className="px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                    style={{
                      color: '#FFFFFF',
                      backgroundColor: '#F2A541',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E89B2E'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F2A541'
                    }}
                  >
                    ⭐ {lang === 'hi' ? 'मेरी फसलें दिखाएं' : 'Show My Crops'} ({starredCrops.length})
                  </button>
                </motion.div>
              )}

              {/* Crop Cards Grid */}
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCrops.map((crop, idx) => {
                  const cropPrices = prices.filter((p) => p.cropEn === crop.name_en)
                  const bestPrice =
                    cropPrices.length > 0
                      ? Math.max(...cropPrices.map((p) => p.modalPrice))
                      : 0

                  return (
                    <motion.button
                      key={crop.id}
                      id={`crop-card-${crop.name_en.toLowerCase().replace(/\s+/g, '-')}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3), duration: 0.3 }}
                      onClick={() => setSelectedCrop(crop.name_en)}
                      className="group rounded-xl p-5 text-left transition-all hover:scale-105 hover:shadow-lg"
                      style={{ backgroundColor: '#FAF3E0', border: '2px solid #E8DCC8' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className="text-xl font-bold mb-1"
                            style={{ color: '#1F3C88' }}
                          >
                            {lang === 'hi' ? crop.name_hi : crop.name_en}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {cropPrices.length} {lang === 'hi' ? 'मंडियां' : 'mandis'}
                          </p>
                          <p className="text-2xl font-bold" style={{ color: '#7FB069' }}>
                            ₹{bestPrice.toLocaleString('en-IN')}
                            <span className="text-xs text-gray-500 ml-1">best price</span>
                          </p>
                        </div>
                      </div>
                      <div
                        className="mt-4 inline-flex items-center font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
                        style={{
                          color: '#1F3C88',
                          backgroundColor: 'rgba(31, 60, 136, 0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(31, 60, 136, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(31, 60, 136, 0.1)'
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
                className="mb-8 rounded-xl border-2 p-5"
                style={{ borderColor: '#E8DCC8', backgroundColor: '#FAF3E0' }}
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
                        backgroundColor: '#FFFFFF',
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
                        className="w-full md:w-auto px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
                        style={{
                          color: '#FFFFFF',
                          backgroundColor: '#F2A541',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E89B2E'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F2A541'
                        }}
                      >
                        ⭐ {lang === 'hi' ? 'मेरी फसलें' : 'My Crops'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

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
                            onViewTrend={() =>
                              setExpandedMandi(expandedMandi === mandi.id ? null : mandi.id)
                            }
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
                                data={[]}
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
    </FeaturePageLayout>
  )
  
}
