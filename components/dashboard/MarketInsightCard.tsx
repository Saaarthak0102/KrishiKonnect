'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import cropsData from '@/data/crops.json'
import mandiPricesData from '@/data/mandiPrices.json'

interface MandiPriceData {
  crop: string
  state: string
  mandi: string
  modalPrice: number
  trend: {
    direction: 'up' | 'down' | 'stable'
    change: string
  }
}

interface InsightData {
  cropName: string
  cropNameHi: string
  state: string
  mandi: string
  modalPrice: number
  trend: 'up' | 'down' | 'stable'
  change: string
}

const translations = {
  en: {
    marketInsight: 'Market Insight',
    noInsightTitle: 'No market insights yet',
    noInsightMessage: 'Save crops in Krishi Fasal to get price insights.',
    exploreCropLibrary: 'Explore Krishi Fasal →',
    pricesRising: 'prices are currently rising',
    pricesFalling: 'prices are currently falling',
    pricesStable: 'prices are stable',
    considerSelling: 'Consider selling within the next 3–5 days.',
    bestMandiToday: 'Best Krishi Bazaar today',
    perQuintal: '/quintal',
  },
  hi: {
    marketInsight: 'बाजार अंतर्दृष्टि',
    noInsightTitle: 'कोई बाजार अंतर्दृष्टि नहीं है',
    noInsightMessage: 'कीमत अंतर्दृष्टि के लिए कृषि फसल में फसलें सहेजें।',
    exploreCropLibrary: 'कृषि फसल खोजें →',
    pricesRising: 'भाव वर्तमान में बढ़ रहे हैं',
    pricesFalling: 'भाव वर्तमान में गिर रहे हैं',
    pricesStable: 'भाव स्थिर हैं',
    considerSelling: 'अगले 3–5 दिनों में बेचने पर विचार करें।',
    bestMandiToday: 'आज का सर्वश्रेष्ठ कृषि बाजार',
    perQuintal: '/क्विंटल',
  },
}

const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
  if (trend === 'up') return 'text-[#7FB069]'
  if (trend === 'down') return 'text-[#B85C38]'
  return 'text-gray-600'
}

interface MarketInsightCardProps {
  starredCrops: string[]
}

export default function MarketInsightCard({ starredCrops }: MarketInsightCardProps) {
  const { lang } = useLanguage()
  const t = translations[lang]

  // Compute market insight from starred crops and mandi prices
  const insight = useMemo((): InsightData | null => {
    if (!starredCrops || starredCrops.length === 0) {
      return null
    }

    let bestInsight: InsightData | null = null
    let highestPrice = 0

    // For each starred crop, find the mandi with the highest price
    starredCrops.forEach((cropId) => {
      const crop = cropsData.find((c) => c.id === cropId)
      if (!crop) return

      const cropName = crop.name_en
      const cropNameHi = crop.name_hi

      // Get all mandi prices for this crop
      const cropPrices = (mandiPricesData.prices as MandiPriceData[]).filter(
        (p) => p.crop.toLowerCase() === cropName.toLowerCase()
      )

      if (cropPrices.length === 0) return

      // Find the mandi with the highest modal price
      const bestMandi = cropPrices.reduce((best, current) => {
        return current.modalPrice > best.modalPrice ? current : best
      })

      // Update best insight if this is the highest price so far
      if (bestMandi.modalPrice > highestPrice) {
        highestPrice = bestMandi.modalPrice
        bestInsight = {
          cropName,
          cropNameHi,
          state: bestMandi.state,
          mandi: bestMandi.mandi,
          modalPrice: bestMandi.modalPrice,
          trend: bestMandi.trend.direction,
          change: bestMandi.trend.change,
        }
      }
    })

    return bestInsight
  }, [starredCrops])

  // If no insight, show empty state
  if (!insight) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col"
      >
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
        <span>📊</span>
        {t.marketInsight}
      </h3>

        <div className="py-12 px-6 text-center">
          <div className="mb-4 text-5xl">📊</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {t.noInsightTitle}
          </h4>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            {lang === 'hi' ? (
              <>कीमत अंतर्दृष्टि के लिए <span className="text-[#2D4B8C]">कृषि</span>{' '}<span className="text-[#C96A3A]">फसल</span> में फसलें सहेजें।</>
            ) : (
              <>Save crops in <span className="text-[#2D4B8C]">Krishi</span>{' '}<span className="text-[#C96A3A]">Fasal</span> to get price insights.</>
            )}
          </p>
          <Link
            href="/crop-library"
            className="inline-block bg-[#1F3C88] hover:bg-[#1F3C88]/80 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {lang === 'hi' ? (
              <><span className="text-white">कृषि</span>{' '}<span className="text-white">फसल</span> खोजें →</>
            ) : (
              <>Explore <span className="text-white">Krishi</span>{' '}<span className="text-white">Fasal</span> →</>
            )}
          </Link>
        </div>
      </motion.div>
    )
  }

  // Generate trend message
  const getTrendMessage = () => {
    if (insight.trend === 'up') return t.pricesRising
    if (insight.trend === 'down') return t.pricesFalling
    return t.pricesStable
  }

  // Generate the insight text
  const insightText = `${insight.cropName} ${getTrendMessage()} in ${insight.state} mandis.`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <span>📊</span>
        {t.marketInsight}
      </h3>

      <div className="space-y-4">
        {/* Main insight text */}
        <p className="text-base text-gray-900 font-medium">
          {insightText}
        </p>

        {/* Recommendation */}
        <p className="text-sm text-gray-600">
          {t.considerSelling}
        </p>

        {/* Best mandi section */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            {lang === 'hi' ? (
              <>आज का सर्वश्रेष्ठ <span className="text-[#2D4B8C]">कृषि</span>{' '}<span className="text-[#C96A3A]">बाजार</span></>
            ) : (
              <>Best <span className="text-[#2D4B8C]">Krishi</span>{' '}<span className="text-[#C96A3A]">Bazaar</span> today</>
            )}
          </p>
          <div className="flex items-baseline justify-between">
            <h4 className="text-lg font-bold text-gray-900">
              {insight.mandi}
            </h4>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getTrendColor(insight.trend)}`}>
                ₹{insight.modalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{t.perQuintal}</p>
            </div>
          </div>
          <p className={`text-xs font-medium mt-2 ${getTrendColor(insight.trend)}`}>
            {insight.trend === 'up' ? '📈' : insight.trend === 'down' ? '📉' : '➡️'} {insight.change}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
