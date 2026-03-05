'use client'

import { memo } from 'react'

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
      ? 'text-krishi-primary'
      : 'text-krishi-highlight'

  const prefix = averageChange > 0 ? '+' : ''

  return (
    <section className="rounded-xl border-2 border-krishi-border bg-white p-5">
      <h3 className="text-lg font-bold text-krishi-heading">
        {lang === 'hi' ? 'Market Trend (7 Days)' : 'Market Trend (7 Days)'}
      </h3>
      <p className={`mt-2 text-base font-bold ${trendColorClass}`}>{label}</p>
      <p className="mt-1 text-sm text-krishi-text/80">
        {lang === 'hi' ? 'Average Change' : 'Average Change'}: {prefix}
        {averageChange.toFixed(1)}%
      </p>
    </section>
  )
}

export default memo(WeeklyMarketTrend)
