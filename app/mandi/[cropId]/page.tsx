'use client'

import { useEffect, useMemo, useState } from 'react'
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
        <main className="container mx-auto px-4 py-10 md:py-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/mandi?state=${encodeURIComponent(selectedState)}`}
              className="text-sm font-semibold text-krishi-primary hover:text-krishi-primary/80"
            >
              ← {lang === 'hi' ? 'सभी फसलों पर वापस' : 'Back to all crops'}
            </Link>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-krishi-text">
                {lang === 'hi' ? 'राज्य' : 'State'}
              </label>
              <select
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
                className="rounded-lg border-2 border-krishi-border bg-white/80 px-3 py-2 text-sm text-krishi-text"
              >
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-krishi-heading md:text-5xl">
            {lang === 'hi' ? cropMeta.name_hi : cropMeta.name_en}
          </h1>

          {loading ? (
            <div className="mt-8 rounded-2xl border-2 border-krishi-border bg-white/70 backdrop-blur-md p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-krishi-primary border-t-transparent" />
              <p className="mt-3 text-krishi-text/70">
                {lang === 'hi' ? 'भाव लोड हो रहे हैं...' : 'Loading crop prices...'}
              </p>
            </div>
          ) : (
            <>
              <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-krishi-border bg-white/70 backdrop-blur-md p-6"
                >
                  <p className="inline-block rounded-full bg-[#B85C38]/15 px-3 py-1 text-xs font-bold text-[#B85C38]">
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
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl border-2 border-krishi-border bg-white/70 backdrop-blur-md p-6"
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

              <section className="mt-8 rounded-2xl border-2 border-krishi-border bg-white/70 backdrop-blur-md p-6">
                <h2 className="text-2xl font-bold text-krishi-heading">
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
                    {mandiRowsForCrop.map((row) => (
                      <div
                        key={row.id}
                        className="rounded-xl border border-krishi-border bg-white/50 backdrop-blur-sm px-4 py-3"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-bold text-krishi-heading">{row.mandiEn}</p>
                            <p className="text-sm text-krishi-text/80">
                              ₹{row.modalPrice} ({lang === 'hi' ? 'मोडल' : 'modal'})
                            </p>
                            <p className="text-xs text-krishi-text/70">
                              {lang === 'hi' ? 'न्यूनतम:' : 'Min:'} ₹{row.minPrice} |{' '}
                              {lang === 'hi' ? 'अधिकतम:' : 'Max:'} ₹{row.maxPrice}
                            </p>
                          </div>

                          <Link
                            href={`/transport?crop=${encodeURIComponent(cropId)}&mandi=${encodeURIComponent(row.mandiEn)}`}
                            className="inline-flex w-fit items-center rounded-lg bg-krishi-primary px-4 py-2 text-sm font-semibold text-white hover:bg-krishi-primary/90"
                          >
                            {lang === 'hi' ? 'ट्रांसपोर्ट बुक करें' : 'Book Transport'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        <Footer />
      </div>
    </FeaturePageLayout>
  )
}
