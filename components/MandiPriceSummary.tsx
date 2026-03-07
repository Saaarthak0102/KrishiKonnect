'use client'

import { motion } from 'framer-motion'
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
        {lang === 'hi' ? 'Price Summary' : 'Price Summary'}
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-krishi-indigo md:grid-cols-2">
        <p>{lang === 'hi' ? 'Best Price' : 'Best Price'}: ₹{bestPrice.toLocaleString('en-IN')}</p>
        <p>{lang === 'hi' ? 'Average Price' : 'Average Price'}: ₹{averagePrice.toLocaleString('en-IN')}</p>
        <p>{lang === 'hi' ? 'Lowest Price' : 'Lowest Price'}: ₹{lowestPrice.toLocaleString('en-IN')}</p>
        <p>{lang === 'hi' ? 'Mandis Available' : 'Mandis Available'}: {mandiCount}</p>
      </div>
    </motion.section>
  )
}

export default memo(MandiPriceSummary)
