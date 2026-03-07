'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'
import type { MandiPrice } from '@/lib/mandiService'

interface NearbyMandisCardProps {
  userState: string
  mandis: MandiPrice[]
  lang: 'hi' | 'en'
}

function NearbyMandisCard({ userState, mandis, lang }: NearbyMandisCardProps) {
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
        {lang === 'hi' ? `Nearby Mandis in ${userState}` : `Nearby Mandis in ${userState}`}
      </h3>

      {mandis.length === 0 ? (
        <p className="mt-3 text-sm text-krishi-indigo/70">
          {lang === 'hi'
            ? 'आपके राज्य में इस फसल के लिए मंडी डेटा उपलब्ध नहीं है।'
            : 'No nearby mandis found for your state.'}
        </p>
      ) : (
        <ol className="mt-3 space-y-2 text-sm text-krishi-indigo">
          {mandis.map((mandi, index) => (
            <li key={mandi.id} className="badge-glow rounded-full px-3 py-1" style={{ background: 'rgba(46,157,87,0.1)', border: '1px solid rgba(46,157,87,0.24)' }}>
              {index + 1}. {mandi.mandiEn} ₹{mandi.modalPrice.toLocaleString('en-IN')}
            </li>
          ))}
        </ol>
      )}
    </motion.section>
  )
}

export default memo(NearbyMandisCard)
