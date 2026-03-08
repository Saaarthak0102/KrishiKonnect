'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'
import { bazaarHeadingsHindi, formatTrendHindi } from '@/data/krishiBazaarHindiData'

interface WeeklyMarketTrendProps {
  direction: 'up' | 'down' | 'stable'
  label: string
  averageChange: number
  lang: 'hi' | 'en'
}

function WeeklyMarketTrend({
  direction,
  label,
  averageChange,
  lang,
}: WeeklyMarketTrendProps) {
  const trendColorClass =
    direction === 'up'
      ? 'text-krishi-agriculture'
      : direction === 'down'
      ? 'text-krishi-clay'
      : 'text-krishi-highlight'

  const prefix = averageChange > 0 ? '+' : ''
  const trendLabel = lang === 'hi' ? formatTrendHindi(direction) : label

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
      <h3 className="text-lg font-bold text-krishi-indigo">
        {lang === 'hi' ? bazaarHeadingsHindi.marketTrend : 'Market Trend (7 Days)'}
      </h3>
      <p className={`badge-glow mt-2 inline-flex rounded-full px-3 py-1 text-base font-bold ${trendColorClass}`} style={{ background: 'rgba(46,157,87,0.1)', border: '1px solid rgba(46,157,87,0.25)' }}>{trendLabel}</p>
      <p className="mt-1 text-sm text-krishi-indigo/80">
        {lang === 'hi' ? 'औसत बदलाव' : 'Average Change'}: {prefix}
        {averageChange.toFixed(1)}%
      </p>
    </motion.section>
  )
}

export default memo(WeeklyMarketTrend)
