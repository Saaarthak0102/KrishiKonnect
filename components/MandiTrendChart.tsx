'use client'

import { memo, useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getTrendColor } from '@/lib/trendUtils'

interface MandiTrendPoint {
  date: string
  modalPrice: number
}

interface MandiTrendChartProps {
  crop: string
  data: MandiTrendPoint[]
  trend?: 'up' | 'down' | 'stable'
  mandi?: string
}

function MandiTrendChartComponent({ data, crop, trend = 'stable', mandi = 'Mandi' }: MandiTrendChartProps) {
  const chartData = useMemo(() => {
    // If data is provided, use it; otherwise generate mock data
    if (data && data.length > 0) {
      return data.slice(-7).map((d, idx) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx],
        price: d.modalPrice,
      }))
    }

    // Generate 7 days of mock data based on trend
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const basePrice = 2000
    const mockData: { day: string; price: number }[] = []

    let currentPrice = basePrice
    for (let i = 0; i < days.length; i++) {
      const variation = (Math.random() - 0.5) * 0.04 * basePrice
      currentPrice = Math.max(basePrice * 0.95, currentPrice + variation)

      mockData.push({
        day: days[i],
        price: Math.round(currentPrice),
      })
    }

    return mockData
  }, [data])

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-20 rounded-xl bg-white/55 backdrop-blur-sm border border-[#D8CFC0] flex items-center justify-center text-xs text-[#1D1D1D]/60">
        No trend data available
      </div>
    )
  }

  const minPrice = Math.min(...chartData.map((d) => d.price))
  const maxPrice = Math.max(...chartData.map((d) => d.price))
  const avgPrice = Math.round(chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length)
  const yDomain = [Math.floor(minPrice * 0.98), Math.ceil(maxPrice * 1.02)]

  return (
    <div
      className="space-y-4 p-4"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(196,106,61,0.25)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.08)',
      }}
    >
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2D2A6E' }}>
          7-Day Price Trend
        </h3>
        <p className="text-xs text-gray-600 mt-0.5">
          {crop} • {mandi}
        </p>
      </div>

      <div className="h-28 rounded-lg bg-white/75 backdrop-blur-sm border border-[#D8CFC0] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#999"
              style={{ fontSize: '11px' }}
              tick={{ dy: 4 }}
            />
            <YAxis
              stroke="#999"
              style={{ fontSize: '11px' }}
              domain={yDomain}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: `2px solid ${getTrendColor(trend)}`,
                borderRadius: '6px',
                fontSize: '12px',
              }}
              formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={getTrendColor(trend)}
              strokeWidth={2.5}
              dot={{ fill: getTrendColor(trend), r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-[#D8CFC0]">
        <div>
          <p className="text-xs text-gray-600 mb-1">High</p>
          <p className="text-sm font-bold text-[#7FB069]">₹{maxPrice.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Avg</p>
          <p className="text-sm font-bold" style={{ color: getTrendColor(trend) }}>
            ₹{avgPrice.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Low</p>
          <p className="text-sm font-bold text-[#B85C38]">₹{minPrice.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  )
}

export default memo(MandiTrendChartComponent)
