'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { cropFertilizerData } from '@/data/fertilizers'
import {
  bazaarButtonsHindi,
  bazaarHeadingsHindi,
  fertilizerHindiData,
  pesticideHindiData,
} from '@/data/krishiBazaarHindiData'

interface MandiPriceSummaryProps {
  selectedCrop: string | null
  lang: 'hi' | 'en'
}

function MandiPriceSummary({
  selectedCrop,
  lang,
}: MandiPriceSummaryProps) {
  const router = useRouter()
  const cropKey = selectedCrop?.toLowerCase().replace(/\s+/g, '-') || ''
  const fertilizerItems = cropFertilizerData[cropKey] ?? []
  const hindiInputItems = [
    ...fertilizerHindiData.map((item) => ({
      name: item.name,
      nameHindi: item.nameHindi,
      description: item.descriptionHindi,
      priceLabel: item.price,
      type: 'उर्वरक',
    })),
    ...pesticideHindiData.map((item) => ({
      name: item.name,
      nameHindi: item.nameHindi,
      description: item.descriptionHindi,
      priceLabel: item.price,
      type: 'कीटनाशक',
    })),
  ]

  const handleBuy = (itemName: string) => {
    if (!cropKey) return
    const normalizedItem = itemName.toLowerCase().replace(/\s+/g, '-')
    router.push(`/buy-input?crop=${encodeURIComponent(cropKey)}&item=${encodeURIComponent(normalizedItem)}`)
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
      <h3 className="text-lg font-bold text-krishi-indigo">
        {lang === 'hi' ? bazaarHeadingsHindi.fertilizerSection : 'Fertilizer & Crop Care'}
      </h3>
      <div className="mt-3 space-y-2 text-sm text-krishi-indigo">
        {lang === 'hi'
          ? hindiInputItems.slice(0, 3).map((item) => (
              <div
                key={`${cropKey}-${item.name}`}
                className="rounded-[12px] border p-3"
                style={{
                  borderColor: 'rgba(196,106,61,0.25)',
                  background: 'rgba(255,255,255,0.45)',
                }}
              >
                <p className="font-semibold" style={{ color: '#2D2A6E' }}>
                  {item.nameHindi} ({item.type})
                </p>
                <p className="mt-1 text-xs" style={{ color: 'rgba(45,42,110,0.78)' }}>
                  {item.description}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold" style={{ color: '#C46A3D' }}>
                    {item.priceLabel}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1, backgroundColor: '#B95D31' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={() => handleBuy(item.name)}
                    className="rounded-[10px] px-4 py-1.5 text-xs font-semibold text-white"
                    style={{
                      backgroundColor: '#C46A3D',
                      border: '1px solid rgba(196,106,61,0.7)',
                    }}
                  >
                    {bazaarButtonsHindi.buy}
                  </motion.button>
                </div>
              </div>
            ))
          : fertilizerItems.slice(0, 3).map((item) => (
              <div
                key={`${cropKey}-${item.name}`}
                className="rounded-[12px] border p-3"
                style={{
                  borderColor: 'rgba(196,106,61,0.25)',
                  background: 'rgba(255,255,255,0.45)',
                }}
              >
                <p className="font-semibold" style={{ color: '#2D2A6E' }}>
                  {item.name} ({item.type})
                </p>
                <p className="mt-1 text-xs" style={{ color: 'rgba(45,42,110,0.78)' }}>
                  {item.description}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold" style={{ color: '#C46A3D' }}>
                    ₹{item.price.toLocaleString('en-IN')} / {item.unit}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1, backgroundColor: '#B95D31' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={() => handleBuy(item.name)}
                    className="rounded-[10px] px-4 py-1.5 text-xs font-semibold text-white"
                    style={{
                      backgroundColor: '#C46A3D',
                      border: '1px solid rgba(196,106,61,0.7)',
                    }}
                  >
                    Buy
                  </motion.button>
                </div>
              </div>
            ))}
        {!fertilizerItems.length && lang !== 'hi' && (
          <p style={{ color: 'rgba(45,42,110,0.75)' }}>
            {lang === 'hi' ? 'इस फसल के लिए सुझाव उपलब्ध नहीं हैं।' : 'No suggestions available for this crop yet.'}
          </p>
        )}
      </div>
    </motion.section>
  )
}

export default memo(MandiPriceSummary)
