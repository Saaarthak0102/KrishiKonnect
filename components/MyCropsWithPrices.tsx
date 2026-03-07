'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import {
  fetchCropPriceHistory,
  getBestPriceForCrop,
  PriceTrend,
} from '@/lib/mandiService'
import { getTrendColorClass, getTrendBgColorClass, getTrendIcon } from '@/lib/trendUtils'
import cropsData from '@/data/crops.json'
import MandiTrendChart from '@/components/MandiTrendChart'

interface CropPriceData {
  cropId: string
  cropNameEn: string
  cropNameHi: string
  price: number | null
  trend: 'up' | 'down' | 'stable'
  mandiName: string
  lastUpdated: string
  history: PriceTrend[]
}

interface MyCropsWithPricesProps {
  primaryCrop: string
  starredCrops: string[]
}

const getTrendArrow = (trend: 'up' | 'down' | 'stable'): string => {
  return getTrendIcon(trend)
}

const getTrendText = (trend: 'up' | 'down' | 'stable', lang: 'en' | 'hi') => {
  if (lang === 'hi') {
    if (trend === 'up') return 'बढ़ रहा है'
    if (trend === 'down') return 'गिर रहा है'
    return 'स्थिर'
  }

  if (trend === 'up') return 'Rising'
  if (trend === 'down') return 'Falling'
  return 'Stable'
}

export default function MyCropsWithPrices({
  primaryCrop,
  starredCrops,
}: MyCropsWithPricesProps) {
  const { lang } = useLanguage()
  const [pricesData, setPricesData] = useState<Record<string, CropPriceData | null>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use only starred crops, limit to 5
  const allCrops = useMemo(() => {
    return starredCrops.slice(0, 5)
  }, [starredCrops])

  // Get crop display names from crops.json
  const getCropInfo = (cropId: string) => {
    const crop = cropsData.find((c) => c.id === cropId.toLowerCase())
    return {
      nameEn: crop?.name_en || cropId,
      nameHi: crop?.name_hi || cropId,
    }
  }

  // Fetch prices for all crops
  useEffect(() => {
    const fetchAllPrices = async () => {
      setLoading(true)
      setError(null)
      try {
        const prices: Record<string, CropPriceData | null> = {}
        const entries = await Promise.all(
          allCrops.map(async (cropId) => {
            try {
              const [bestPrice, history] = await Promise.all([
                getBestPriceForCrop(cropId),
                fetchCropPriceHistory(cropId),
              ])

              return [cropId, bestPrice, history] as const
            } catch (cropError) {
              console.error(`Error fetching data for crop ${cropId}:`, cropError)
              return [cropId, null, []] as const
            }
          })
        )

        for (const [cropId, bestPrice, history] of entries) {
          const cropInfo = getCropInfo(cropId)

          if (bestPrice) {
            prices[cropId] = {
              cropId,
              cropNameEn: cropInfo.nameEn,
              cropNameHi: cropInfo.nameHi,
              price: bestPrice.modalPrice,
              trend: bestPrice.trend,
              mandiName: bestPrice.mandiEn,
              lastUpdated: 'Today',
              history,
            }
          } else {
            prices[cropId] = null
          }
        }

        setPricesData(prices)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch crop prices'
        setError(errorMessage)
        console.error('Error fetching crop prices:', error)
      } finally {
        setLoading(false)
      }
    }

    if (allCrops.length > 0) {
      fetchAllPrices()
    }
  }, [allCrops])

  // Filter out null entries
  const validCrops = useMemo(() => {
    return allCrops.filter((cropId) => pricesData[cropId] !== null && pricesData[cropId] !== undefined)
  }, [allCrops, pricesData])

  const translations = {
    hi: {
      myCrops: 'मेरी फसलें',
      latestMandiPrices: 'आपकी फसलों के लिए नवीनतम कृषि बाजार भाव',
      topMandi: 'शीर्ष कृषि बाजार',
      updated: 'अपडेट',
      today: 'आज',
      quintal: 'क्विंटल',
      exploreCrops: 'कृषि फसल खोजें',
      noCropsSelected: 'अभी कोई फसल नहीं चुनी गई',
      noCropsMessage: 'बाजार सतर्कताएं और सिफारिशों तक जल्दी पहुंचने के लिए फसलें सहेजें।',
    },
    en: {
      myCrops: 'My Crops',
      latestMandiPrices: 'Latest Krishi Bazaar prices for your crops',
      topMandi: 'Top Krishi Bazaar',
      updated: 'Updated',
      today: 'Today',
      quintal: 'quintal',
      exploreCrops: 'Explore Krishi Fasal →',
      noCropsSelected: 'No crops selected yet',
      noCropsMessage: 'Save crops to quickly access market alerts and recommendations.',
    },
  }

  const t = translations[lang]

  // Empty state
  if (allCrops.length === 0 || validCrops.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-krishi-indigo mb-6 flex items-center gap-2">
          <span>🌾</span>
          {t.myCrops}
        </h2>

        <div className="py-12 px-6 text-center">
          <div className="mb-4 text-5xl">🌾</div>
          <h3 className="text-lg font-bold text-krishi-indigo mb-2">
            {t.noCropsSelected}
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            {t.noCropsMessage}
          </p>
          <Link
            href="/crop-library"
            className="inline-block bg-[#1F3C88] hover:bg-[#1F3C88]/80 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {lang === 'hi' ? (
              <><span className="text-white">कृषि</span>{' '}<span className="text-white">फसल</span> खोजें</>
            ) : (
              <>Explore <span className="text-white">Krishi</span>{' '}<span className="text-white">Fasal</span> →</>
            )}
          </Link>
        </div>
      </motion.div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-krishi-indigo mb-6 flex items-center gap-2">
          <span>🌾</span>
          {t.myCrops}
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {allCrops.map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-gray-100 rounded-lg h-16"
            ></div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-krishi-indigo flex items-center gap-2 mb-1">
          <span>🌾</span>
          {t.myCrops}
        </h2>
        <p className="text-sm text-gray-600">
          {lang === 'hi' ? (
            <>आपकी फसलों के लिए नवीनतम <span className="text-[#2D4B8C]">कृषि</span>{' '}<span className="text-[#C96A3A]">बाजार</span> भाव</>
          ) : (
            <>Latest <span className="text-[#2D4B8C]">Krishi</span>{' '}<span className="text-[#C96A3A]">Bazaar</span> prices for your crops</>
          )}
        </p>
      </div>

      <div className="my-crops-list">
        {validCrops.map((cropId, index) => {
          const cropData = pricesData[cropId]
          if (!cropData) return null

          const cropName = lang === 'hi' ? cropData.cropNameHi : cropData.cropNameEn
          const trendArrow = getTrendArrow(cropData.trend)
          const trendText = getTrendText(cropData.trend, lang)
          const trendColorClass = 
            cropData.trend === 'up' ? 'crop-trend-up' : 
            cropData.trend === 'down' ? 'crop-trend-down' : 
            'crop-trend-stable'

          return (
            <Link
              key={cropId}
              href={`/mandi?crop=${cropId}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="crop-row"
              >
                <div className="crop-row-info">
                  <span className="crop-name">{cropName}</span>
                  <span className="crop-mandi">{cropData.mandiName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="crop-price">
                      ₹{cropData.price?.toLocaleString()}
                    </p>
                    <p className={`crop-trend ${trendColorClass}`}>
                      {trendArrow} {trendText}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
