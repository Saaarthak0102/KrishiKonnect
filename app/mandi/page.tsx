'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import Footer from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import cropsData from '@/data/crops.json'
import {
  fetchMandiPricesWithCache,
  getAllStates,
  getBestPriceFromRows,
  groupPricesByCommodity,
  MandiPrice,
} from '@/lib/mandiService'

const DEFAULT_STATE = 'Uttar Pradesh'

function formatUpdatedLabel(dateText: string, lang: 'en' | 'hi'): string {
  if (!dateText) {
    return lang === 'hi' ? 'आज अपडेट' : 'Updated Today'
  }

  const parsed = new Date(dateText)
  if (Number.isNaN(parsed.getTime())) {
    return lang === 'hi' ? 'आज अपडेट' : 'Updated Today'
  }

  const today = new Date()
  const isToday =
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()

  if (isToday) {
    return lang === 'hi' ? 'आज अपडेट' : 'Updated Today'
  }

  return `${lang === 'hi' ? 'अपडेट' : 'Updated'} ${parsed.toLocaleDateString(
    lang === 'hi' ? 'hi-IN' : 'en-IN'
  )}`
}

export default function MandiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { farmerProfile } = useAuth()
  const { lang } = useLanguage()

  const [stateOptions, setStateOptions] = useState<string[]>([])
  const [selectedState, setSelectedState] = useState<string>(DEFAULT_STATE)
  const [searchTerm, setSearchTerm] = useState('')
  const [stateRows, setStateRows] = useState<MandiPrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const queryCrop = searchParams.get('crop')
    if (!queryCrop) return

    const cropExists = cropsData.some((crop) => crop.id === queryCrop)
    if (!cropExists) return

    const state =
      searchParams.get('state') || farmerProfile?.state || selectedState || DEFAULT_STATE

    router.replace(`/mandi/${queryCrop}?state=${encodeURIComponent(state)}`)
  }, [farmerProfile?.state, router, searchParams, selectedState])

  useEffect(() => {
    const loadStates = async () => {
      const states = await getAllStates()
      setStateOptions(states)
    }

    loadStates()
  }, [])

  useEffect(() => {
    if (!farmerProfile?.state) return
    setSelectedState((current) => current || farmerProfile.state)
  }, [farmerProfile?.state])

  useEffect(() => {
    const loadStatePrices = async () => {
      // Load cached data immediately and set loading state
      const cachedData = await fetchMandiPricesWithCache(
        selectedState,
        500,
        (freshData) => {
          // Callback when fresh data arrives from API
          setStateRows(freshData)
        }
      )

      // Set initial cached data
      setStateRows(cachedData)
      
      // Only set loading to false immediately if we had cache
      // Otherwise we show loader until fresh data arrives
      setLoading(false)
    }

    loadStatePrices()
  }, [selectedState])

  const cards = useMemo(() => {
    const groupedRows = groupPricesByCommodity(stateRows)

    return cropsData
      .filter((crop) => {
        if (!searchTerm.trim()) return true
        const term = searchTerm.toLowerCase().trim()
        return (
          crop.name_en.toLowerCase().includes(term) ||
          crop.name_hi.toLowerCase().includes(term)
        )
      })
      .map((crop) => {
        const best = getBestPriceFromRows(groupedRows[crop.id] || [])
        return {
          crop,
          best,
        }
      })
  }, [searchTerm, stateRows])

  return (
    <FeaturePageLayout>
      <div className="min-h-screen bg-krishi-bg">
        <main className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <h1 className="mb-3 text-4xl font-bold text-krishi-heading md:text-5xl">
              {lang === 'hi' ? 'मंडी भाव' : 'Mandi Prices'}
            </h1>
            <p className="mx-auto max-w-3xl text-krishi-text/80">
              {lang === 'hi'
                ? 'सीधे जानें: भाव क्या है, कहां बेचना है, और ट्रांसपोर्ट कैसे बुक करना है।'
                : 'Get clear answers fast: price, best mandi, and transport booking.'}
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="mb-8 rounded-2xl border-2 border-krishi-border bg-white p-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-krishi-text">
                  {lang === 'hi' ? 'फसल खोजें' : 'Search Crop'}
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={lang === 'hi' ? 'जैसे मक्का, गेहूं...' : 'e.g. Maize, Wheat...'}
                  className="w-full rounded-xl border-2 border-krishi-border px-4 py-2.5 text-krishi-text outline-none transition-colors focus:border-krishi-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-krishi-text">
                  {lang === 'hi' ? 'राज्य चुनें' : 'Select State'}
                </label>
                <select
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                  className="w-full rounded-xl border-2 border-krishi-border bg-white px-4 py-2.5 text-krishi-text outline-none transition-colors focus:border-krishi-primary"
                >
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.section>

          {loading ? (
            <div className="flex h-52 items-center justify-center rounded-2xl border-2 border-krishi-border bg-white">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-krishi-primary border-t-transparent" />
                <p className="mt-3 text-krishi-text/70">
                  {lang === 'hi' ? 'भाव लोड हो रहे हैं...' : 'Loading prices...'}
                </p>
              </div>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cards.map(({ crop, best }, index) => (
                <motion.article
                  key={crop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.35), duration: 0.35 }}
                  className="rounded-2xl border-2 border-krishi-border bg-white p-5 shadow-sm"
                >
                  <h2 className="text-2xl font-bold text-krishi-heading">
                    {lang === 'hi' ? crop.name_hi : crop.name_en}
                  </h2>

                  <p className="mt-3 text-3xl font-extrabold text-krishi-agriculture">
                    {best ? `₹${best.modalPrice}` : '--'}
                    <span className="ml-1 text-base font-semibold text-krishi-text/70">
                      / {lang === 'hi' ? 'क्विंटल' : 'quintal'}
                    </span>
                  </p>

                  <p className="mt-2 text-sm font-semibold text-krishi-text">
                    {best
                      ? best.mandiEn
                      : lang === 'hi'
                      ? 'इस राज्य में डेटा उपलब्ध नहीं'
                      : 'No mandi data in this state'}
                  </p>

                  <p className="mt-1 rounded-md bg-[#B85C38]/10 px-2.5 py-1 text-xs font-semibold text-[#B85C38] inline-block">
                    {best
                      ? formatUpdatedLabel(best.date, lang)
                      : lang === 'hi'
                      ? 'अभी अपडेट नहीं'
                      : 'No recent update'}
                  </p>

                  <Link
                    href={`/mandi/${crop.id}?state=${encodeURIComponent(selectedState)}`}
                    className="mt-4 inline-flex items-center rounded-lg bg-krishi-heading px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-krishi-heading/90"
                  >
                    {lang === 'hi' ? 'विवरण देखें' : 'View Details'}
                    <span className="ml-2">→</span>
                  </Link>
                </motion.article>
              ))}
            </section>
          )}
        </main>

        <Footer />
      </div>
    </FeaturePageLayout>
  )
}
