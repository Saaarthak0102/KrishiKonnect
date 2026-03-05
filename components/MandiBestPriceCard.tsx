'use client'

import Link from 'next/link'
import { memo } from 'react'
import type { MandiPrice } from '@/lib/mandiService'

interface MandiBestPriceCardProps {
  bestMandi: MandiPrice | null
  lang: 'hi' | 'en'
}

function MandiBestPriceCard({ bestMandi, lang }: MandiBestPriceCardProps) {
  return (
    <section className="rounded-xl border-2 border-krishi-border bg-white p-5">
      <p className="text-sm font-bold text-krishi-primary">
        {lang === 'hi' ? '⭐ आज की सर्वश्रेष्ठ मंडी' : 'Best Mandi Today'}
      </p>

      {bestMandi ? (
        <>
          <p className="mt-3 text-2xl font-bold text-krishi-heading">📍 {bestMandi.mandiEn}</p>
          <p className="text-sm text-krishi-text/80">{bestMandi.state}</p>
          <p className="mt-2 text-3xl font-extrabold text-krishi-agriculture">
            ₹{bestMandi.modalPrice.toLocaleString('en-IN')} / quintal
          </p>
          <p className="mt-2 text-sm font-semibold text-krishi-text/80">
            {lang === 'hi' ? 'ट्रेंड' : 'Trend'}: {bestMandi.trend.toUpperCase()}
          </p>
          <Link
            href={`/transport?crop=${encodeURIComponent(bestMandi.cropEn)}&mandi=${encodeURIComponent(bestMandi.mandiEn)}`}
            className="mt-4 inline-flex rounded-lg bg-krishi-primary px-4 py-2 text-sm font-semibold text-white"
          >
            {lang === 'hi' ? 'यहीं बेचें → ट्रांसपोर्ट' : 'Sell Here → Transport'}
          </Link>
        </>
      ) : (
        <p className="mt-3 text-sm text-krishi-text/70">
          {lang === 'hi' ? 'इस फसल के लिए मंडी डेटा उपलब्ध नहीं है।' : 'No mandi data available for this crop.'}
        </p>
      )}
    </section>
  )
}

export default memo(MandiBestPriceCard)
