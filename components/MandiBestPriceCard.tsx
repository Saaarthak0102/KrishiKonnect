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
    <motion.section
      whileHover={{
        y: -4,
        scale: 1.01,
        boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.16)',
      }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="h-full min-h-[180px] rounded-xl p-5 flex flex-col justify-between"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,106,61,0.25)',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
        willChange: 'transform, box-shadow, opacity',
        transform: 'translateZ(0)',
      }}
    >
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
              <div className="badge-glow flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                <span className="font-medium">{lang === 'hi' ? 'लाइव' : 'Live'}</span>
              </div>
            )}
            <p className="text-xs text-krishi-indigo/70">
              {getTimestamp()}
            </p>
          </div>

          <p className="badge-glow mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold text-krishi-indigo/80" style={{ border: '1px solid rgba(196,106,61,0.25)', background: 'rgba(196,106,61,0.09)' }}>
            {lang === 'hi' ? 'ट्रेंड' : 'Trend'}: {bestMandi.trend.toUpperCase()}
          </p>
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-4"
          >
            <Link
              href={`/transport?crop=${encodeURIComponent(bestMandi.cropEn)}&mandi=${encodeURIComponent(bestMandi.mandiEn)}`}
              className="inline-flex rounded-lg bg-krishi-clay px-4 py-2 text-sm font-semibold text-white"
              style={{ boxShadow: '0 6px 14px rgba(196,106,61,0.2)' }}
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
    </motion.section>
  )
}

export default memo(MandiBestPriceCard)
