'use client'

import Link from 'next/link'
import { memo } from 'react'
import { motion } from 'framer-motion'
import type { MandiPrice } from '@/lib/mandiService'
import { getRelativeTime, isLivePrice } from '@/lib/timeUtils'

interface MandiBestPriceCardProps {
  bestMandi: MandiPrice | null
  lang: 'hi' | 'en'
}

function MandiBestPriceCard({ bestMandi, lang }: MandiBestPriceCardProps) {
  const getTimestamp = (): string => {
    if (!bestMandi) return ''
    const timestamp = (bestMandi as any).date || (bestMandi as any).lastUpdated
    if (!timestamp) return ''
    return getRelativeTime(timestamp, lang === 'hi' ? 'hi' : 'en')
  }

  const isLive = (): boolean => {
    if (!bestMandi) return false
    const timestamp = (bestMandi as any).date || (bestMandi as any).lastUpdated
    if (!timestamp) return false
    return isLivePrice(timestamp)
  }

  return (
    <section className="rounded-xl border border-indigo-200/40 bg-white/45 backdrop-blur-md p-5 shadow-lg">
      <p className="text-sm font-bold text-krishi-clay">
        {lang === 'hi' ? '⭐ आज की सर्वश्रेष्ठ मंडी' : 'Best Mandi Today'}
      </p>

      {bestMandi ? (
        <>
          <p className="mt-3 text-2xl font-bold text-krishi-indigo">📍 {bestMandi.mandiEn}</p>
          <p className="text-sm text-krishi-indigo/80">{bestMandi.state}</p>
          <p className="mt-2 text-3xl font-extrabold text-krishi-agriculture">
            ₹{bestMandi.modalPrice.toLocaleString('en-IN')} / quintal
          </p>
          
          {/* Timestamp and Live Indicator */}
          <div className="mt-2 flex items-center gap-2">
            {isLive() && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                <span className="font-medium">{lang === 'hi' ? 'लाइव' : 'Live'}</span>
              </div>
            )}
            <p className="text-xs text-krishi-indigo/70">
              {getTimestamp()}
            </p>
          </div>

          <p className="mt-2 text-sm font-semibold text-krishi-indigo/80">
            {lang === 'hi' ? 'ट्रेंड' : 'Trend'}: {bestMandi.trend.toUpperCase()}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4"
          >
            <Link
              href={`/transport?crop=${encodeURIComponent(bestMandi.cropEn)}&mandi=${encodeURIComponent(bestMandi.mandiEn)}`}
              className="inline-flex rounded-lg bg-krishi-clay px-4 py-2 text-sm font-semibold text-white"
            >
              {lang === 'hi' ? 'यहीं बेचें → ट्रांसपोर्ट' : 'Sell Here → Transport'}
            </Link>
          </motion.div>
        </>
      ) : (
        <p className="mt-3 text-sm text-krishi-indigo/70">
          {lang === 'hi' ? 'इस फसल के लिए मंडी डेटा उपलब्ध नहीं है।' : 'No mandi data available for this crop.'}
        </p>
      )}
    </section>
  )
}

export default memo(MandiBestPriceCard)
