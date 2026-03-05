'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getPriceTrend, PriceTrend } from '@/lib/mandiService'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

interface PriceTrendChartProps {
  cropId: string
  cropName: string
}

export default function PriceTrendChart({
  cropId,
  cropName,
}: PriceTrendChartProps) {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [data, setData] = useState<PriceTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrend = async () => {
      try {
        setLoading(true)
        const trend = await getPriceTrend(cropId)
        setData(trend)
      } catch (error) {
        console.error('Error loading price trend:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    if (cropId) {
      loadTrend()
    }
  }, [cropId])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-krishi-border bg-white p-8"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-6 w-6 mx-auto animate-spin rounded-full border-4 border-krishi-primary border-t-transparent"></div>
            <p className="mt-4 text-krishi-text/70">
              {lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-dashed border-krishi-border bg-white p-8"
      >
        <div className="text-center text-krishi-text/70">
          <p className="text-4xl mb-2">📊</p>
          <p>
            {lang === 'hi'
              ? 'इस फसल के लिए कोई प्रवृत्ति डेटा उपलब्ध नहीं है।'
              : 'No trend data available for this crop.'}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-krishi-border bg-white p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-krishi-heading mb-1">
          📈 {lang === 'hi' ? 'भाव की प्रवृत्ति' : 'Price Trend'}
        </h3>
        <p className="text-sm text-krishi-text/70">
          {cropName} - {lang === 'hi' ? 'पिछले 7 दिन' : 'Last 7 Days'}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#D8CFC0"
            verticalPoints={[0, 30, 60, 90, 120, 150, 180]}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#1D1D1D', fontSize: 12 }}
            tickFormatter={(value) => {
              // Show only the day part
              const date = new Date(value)
              return date.getDate().toString()
            }}
            label={{
              value: lang === 'hi' ? 'तारीख' : 'Date',
              position: 'insideBottomRight',
              offset: -5,
              fill: '#1D1D1D',
              fontSize: 12,
            }}
          />
          <YAxis
            tick={{ fill: '#1D1D1D', fontSize: 12 }}
            label={{
              value: lang === 'hi' ? 'भाव (₹/क्विंटल)' : 'Price (₹/q)',
              angle: -90,
              position: 'insideLeft',
              fill: '#1D1D1D',
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FAF3E0',
              border: '2px solid #D8CFC0',
              borderRadius: '8px',
              color: '#1D1D1D',
            }}
            labelFormatter={(label) => {
              const date = new Date(label)
              return date.toLocaleDateString(
                lang === 'hi' ? 'hi-IN' : 'en-US'
              )
            }}
            formatter={(value) => [`₹${value}`, lang === 'hi' ? 'भाव' : 'Price']}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={() => (lang === 'hi' ? 'मोडल भाव' : 'Modal Price')}
          />
          <Line
            type="monotone"
            dataKey="modalPrice"
            stroke="#B85C38"
            strokeWidth={3}
            dot={{ fill: '#B85C38', r: 5 }}
            activeDot={{ r: 7 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Stats */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-krishi-bg p-3 text-center">
            <p className="text-xs font-semibold text-krishi-text/70 mb-1">
              {lang === 'hi' ? 'सर्वोच्च' : 'Highest'}
            </p>
            <p className="font-bold text-krishi-primary text-lg">
              ₹{Math.max(...data.map((d) => d.modalPrice))}
            </p>
          </div>
          <div className="rounded-lg bg-krishi-bg p-3 text-center">
            <p className="text-xs font-semibold text-krishi-text/70 mb-1">
              {lang === 'hi' ? 'औसत' : 'Average'}
            </p>
            <p className="font-bold text-krishi-heading text-lg">
              ₹
              {Math.round(
                data.reduce((sum, d) => sum + d.modalPrice, 0) / data.length
              )}
            </p>
          </div>
          <div className="rounded-lg bg-krishi-bg p-3 text-center">
            <p className="text-xs font-semibold text-krishi-text/70 mb-1">
              {lang === 'hi' ? 'न्यूनतम' : 'Lowest'}
            </p>
            <p className="font-bold text-red-600 text-lg">
              ₹{Math.min(...data.map((d) => d.modalPrice))}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
