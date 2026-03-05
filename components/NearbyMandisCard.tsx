'use client'

import { memo } from 'react'
import type { MandiPrice } from '@/lib/mandiService'

interface NearbyMandisCardProps {
  userState: string
  mandis: MandiPrice[]
  lang: 'hi' | 'en'
}

function NearbyMandisCard({ userState, mandis, lang }: NearbyMandisCardProps) {
  return (
    <section className="rounded-xl border-2 border-krishi-border bg-white p-5">
      <h3 className="text-lg font-bold text-krishi-heading">
        {lang === 'hi' ? `Nearby Mandis in ${userState}` : `Nearby Mandis in ${userState}`}
      </h3>

      {mandis.length === 0 ? (
        <p className="mt-3 text-sm text-krishi-text/70">
          {lang === 'hi'
            ? 'आपके राज्य में इस फसल के लिए मंडी डेटा उपलब्ध नहीं है।'
            : 'No nearby mandis found for your state.'}
        </p>
      ) : (
        <ol className="mt-3 space-y-2 text-sm text-krishi-text">
          {mandis.map((mandi, index) => (
            <li key={mandi.id}>
              {index + 1}. {mandi.mandiEn} ₹{mandi.modalPrice.toLocaleString('en-IN')}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default memo(NearbyMandisCard)
