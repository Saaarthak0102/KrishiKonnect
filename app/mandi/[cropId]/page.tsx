'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import cropsData from '@/data/crops.json'
import {
  fetchCropPriceHistory,
  fetchMandiPrices,
  getAllStates,
  getBestPriceFromRows,
  MandiPrice,
  PriceTrend,
} from '@/lib/mandiService'

const DEFAULT_STATE = 'Uttar Pradesh'

export default function MandiCropDetailPage() {
  const params = useParams() as { cropId: string }
  const searchParams = useSearchParams()
  const { lang } = useLanguage()
  const { farmerProfile } = useAuth()

  const [selectedState, setSelectedState] = useState<string>(DEFAULT_STATE)
  const [stateOptions, setStateOptions] = useState<string[]>([])
  const [stateRows, setStateRows] = useState<MandiPrice[]>([])
  const [trendData, setTrendData] = useState<PriceTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const revealRef = useRef<HTMLDivElement | null>(null)

  const cropId = params.cropId

  const cropMeta = useMemo(
    () => cropsData.find((crop) => crop.id === cropId),
    [cropId]
  )

  useEffect(() => {
    const queryState = searchParams.get('state')
    if (queryState) {
      setSelectedState(queryState)
      return
    }

    if (farmerProfile?.state) {
      setSelectedState(farmerProfile.state)
    }
  }, [farmerProfile?.state, searchParams])

  useEffect(() => {
    const loadStates = async () => {
      const states = await getAllStates()
      setStateOptions(states)
    }

    loadStates()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [rows, history] = await Promise.all([
        fetchMandiPrices(selectedState),
        fetchCropPriceHistory(cropId, selectedState),
      ])

      setStateRows(rows)
      setTrendData(history)
      setLoading(false)
    }

    loadData()
  }, [cropId, selectedState])

  const mandiRowsForCrop = useMemo(() => {
    return stateRows
      .filter((row) => row.crop === cropId)
      .slice()
      .sort((a, b) => b.modalPrice - a.modalPrice)
  }, [cropId, stateRows])

  const bestRow = useMemo(() => getBestPriceFromRows(mandiRowsForCrop), [mandiRowsForCrop])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyPreference = () => setReduceMotion(mediaQuery.matches)
    applyPreference()

    mediaQuery.addEventListener('change', applyPreference)
    return () => mediaQuery.removeEventListener('change', applyPreference)
  }, [])

  useEffect(() => {
    if (!revealRef.current) {
      return
    }

    const revealElements = Array.from(
      revealRef.current.querySelectorAll<HTMLElement>('[data-bazaar-reveal="true"]')
    )

    if (!revealElements.length) {
      return
    }

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      revealElements.forEach((element) => element.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [reduceMotion, loading, mandiRowsForCrop.length, trendData.length])

  if (!cropMeta) {
    return (
      <FeaturePageLayout>
        <div className="min-h-screen">
          <main className="container mx-auto px-4 py-16">
            <div className="rounded-2xl border-2 border-krishi-border bg-white/70 backdrop-blur-md p-10 text-center">
              <h1 className="text-3xl font-bold text-krishi-heading">
                {lang === 'hi' ? 'फसल नहीं मिली' : 'Crop not found'}
              </h1>
              <Link
                href="/mandi"
                className="mt-5 inline-block rounded-lg bg-krishi-primary px-5 py-2 font-semibold text-white"
              >
                {lang === 'hi' ? 'मंडी पेज पर वापस' : 'Back to Mandi'}
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </FeaturePageLayout>
    )
  }

  return (
    <FeaturePageLayout>
      <div className="min-h-screen">
        <main ref={revealRef} className="container mx-auto px-4 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-6 flex flex-wrap items-center justify-between gap-3"
          >
            <motion.div whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              <Link
              href={`/mandi?state=${encodeURIComponent(selectedState)}`}
                className="inline-flex rounded-[10px] border px-[14px] py-[8px] text-sm font-semibold"
                style={{
                  color: '#2D2A6E',
                  background: 'rgba(45,42,110,0.08)',
                  borderColor: 'rgba(45,42,110,0.25)',
                }}
              >
                ← {lang === 'hi' ? 'सभी फसलों पर वापस' : 'Back to all crops'}
              </Link>
            </motion.div>

            <div className="bazaar-reveal flex items-center gap-2" data-bazaar-reveal="true">
              <label className="text-sm font-semibold" style={{ color: '#2D2A6E' }}>
                {lang === 'hi' ? 'राज्य' : 'State'}
              </label>
              <select
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
                className="rounded-lg px-3 py-2 text-sm outline-none transition-all duration-[250ms] ease-out"
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(196,106,61,0.25)',
                  color: '#2D2A6E',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6, ease: 'easeOut' }}
            className="text-4xl font-bold md:text-5xl"
            style={{ color: '#2D2A6E' }}
          >
            {lang === 'hi' ? cropMeta.name_hi : cropMeta.name_en}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6, ease: 'easeOut' }}
            className="mt-2 max-w-3xl"
            style={{ color: '#C46A3D' }}
          >
            {lang === 'hi'
              ? 'राज्य-वार मंडी तुलना, ट्रेंड विश्लेषण और बेहतर बिक्री निर्णय के लिए लाइव भाव देखें।'
              : 'Track live mandi prices, compare state-wise markets, and make better selling decisions.'}
          </motion.p>

          {loading ? (
            <div
              className="bazaar-reveal mt-8 p-10 text-center"
              data-bazaar-reveal="true"
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(196,106,61,0.25)',
                borderRadius: '16px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
              }}
            >
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-krishi-primary border-t-transparent" />
              <p className="mt-3" style={{ color: 'rgba(45,42,110,0.72)' }}>
                {lang === 'hi' ? 'भाव लोड हो रहे हैं...' : 'Loading crop prices...'}
              </p>
            </div>
          ) : (
            <>
              <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.5, ease: 'easeOut' }}
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                    boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.16)',
                  }}
                  className="bazaar-reveal p-6"
                  data-bazaar-reveal="true"
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
                  <p className="badge-glow inline-block rounded-full bg-[#B85C38]/15 px-3 py-1 text-xs font-bold text-[#B85C38]" style={{ border: '1px solid rgba(196,106,61,0.25)' }}>
                    ⭐ {lang === 'hi' ? 'आज का सर्वश्रेष्ठ भाव' : 'Best Price Today'}
                  </p>

                  <p className="mt-4 text-4xl font-extrabold text-krishi-agriculture">
                    {bestRow ? `₹${bestRow.modalPrice}` : '--'}
                  </p>

                  <p className="mt-2 text-lg font-bold text-krishi-heading">
                    {bestRow
                      ? bestRow.mandiEn
                      : lang === 'hi'
                      ? 'इस राज्य में डेटा उपलब्ध नहीं'
                      : 'No mandi data for this state'}
                  </p>

                  {bestRow && (
                    <p className="mt-2 text-sm text-krishi-text/70">
                      {lang === 'hi' ? 'अपडेट:' : 'Updated:'}{' '}
                      {new Date(bestRow.date).toLocaleDateString(
                        lang === 'hi' ? 'hi-IN' : 'en-IN'
                      )}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                    boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.16)',
                  }}
                  className="bazaar-reveal p-6"
                  data-bazaar-reveal="true"
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
                  <h2 className="text-xl font-bold text-krishi-heading">
                    {lang === 'hi' ? '7-दिन भाव ट्रेंड' : '7-Day Price Trend'}
                  </h2>

                  <div className="mt-4 h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <XAxis dataKey="date" stroke="#1D1D1D" fontSize={12} />
                        <YAxis stroke="#1D1D1D" fontSize={12} />
                        <Tooltip
                          formatter={(value) => [`₹${value}`, lang === 'hi' ? 'भाव' : 'Price']}
                          contentStyle={{
                            borderRadius: 12,
                            border: '2px solid #D8CFC0',
                            background: 'rgba(250, 243, 224, 0.8)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="modalPrice"
                          stroke="#7FB069"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#7FB069' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </section>

              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5, ease: 'easeOut' }}
                className="bazaar-reveal mt-8 p-6"
                data-bazaar-reveal="true"
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(196,106,61,0.25)',
                  borderRadius: '16px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
                }}
              >
                <h2 className="text-2xl font-bold" style={{ color: '#2D2A6E' }}>
                  {lang === 'hi' ? 'अन्य मंडियां' : 'Other Mandis'}
                </h2>

                {mandiRowsForCrop.length === 0 ? (
                  <p className="mt-4 text-krishi-text/70">
                    {lang === 'hi'
                      ? 'इस फसल के लिए कोई मंडी डेटा उपलब्ध नहीं है।'
                      : 'No mandi rows are available for this crop in the selected state.'}
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {mandiRowsForCrop.map((row, index) => (
                      <motion.div
                        key={row.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + index * 0.05, duration: 0.5, ease: 'easeOut' }}
                        whileHover={{
                          y: -4,
                          scale: 1.01,
                          boxShadow: '0 10px 28px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06), 0 0 16px rgba(196,106,61,0.16)',
                          borderColor: 'rgba(196,106,61,0.35)',
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="bazaar-reveal rounded-xl px-4 py-3"
                        data-bazaar-reveal="true"
                        style={{
                          background: 'rgba(255,255,255,0.55)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                          border: '1px solid rgba(196,106,61,0.25)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
                        }}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-bold" style={{ color: '#2D2A6E' }}>{row.mandiEn}</p>
                            <p className="badge-glow mt-1 inline-flex rounded-full px-3 py-1 text-sm" style={{ color: '#2D2A6E', background: 'rgba(46,157,87,0.10)', border: '1px solid rgba(46,157,87,0.25)' }}>
                              ₹{row.modalPrice} ({lang === 'hi' ? 'मोडल' : 'modal'})
                            </p>
                            <p className="text-xs" style={{ color: 'rgba(45,42,110,0.7)' }}>
                              {lang === 'hi' ? 'न्यूनतम:' : 'Min:'} ₹{row.minPrice} |{' '}
                              {lang === 'hi' ? 'अधिकतम:' : 'Max:'} ₹{row.maxPrice}
                            </p>
                          </div>

                          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
                            <Link
                              href={`/transport?crop=${encodeURIComponent(cropId)}&mandi=${encodeURIComponent(row.mandiEn)}`}
                              className="inline-flex w-fit items-center rounded-lg px-4 py-2 text-sm font-semibold text-white"
                              style={{ background: '#2D2A6E', boxShadow: '0 8px 16px rgba(45,42,110,0.24)' }}
                            >
                              {lang === 'hi' ? 'ट्रांसपोर्ट बुक करें' : 'Book Transport'}
                            </Link>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            </>
          )}
        </main>

        <Footer />
      </div>
    </FeaturePageLayout>
  )
}
