'use client'

import { memo } from 'react'

interface MandiPriceSummaryProps {
  bestPrice: number
  averagePrice: number
  lowestPrice: number
  mandiCount: number
  lang: 'hi' | 'en'
}

function MandiPriceSummary({
  bestPrice,
  averagePrice,
  lowestPrice,
  mandiCount,
  lang,
}: MandiPriceSummaryProps) {
  return (
    <section className="rounded-xl border-2 border-krishi-border bg-white p-5">
      <h3 className="text-lg font-bold text-krishi-heading">
        {lang === 'hi' ? 'Price Summary' : 'Price Summary'}
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-krishi-text md:grid-cols-2">
        <p>{lang === 'hi' ? 'Best Price' : 'Best Price'}: ₹{bestPrice.toLocaleString('en-IN')}</p>
        <p>{lang === 'hi' ? 'Average Price' : 'Average Price'}: ₹{averagePrice.toLocaleString('en-IN')}</p>
        <p>{lang === 'hi' ? 'Lowest Price' : 'Lowest Price'}: ₹{lowestPrice.toLocaleString('en-IN')}</p>
        <p>{lang === 'hi' ? 'Mandis Available' : 'Mandis Available'}: {mandiCount}</p>
      </div>
    </section>
  )
}

export default memo(MandiPriceSummary)
