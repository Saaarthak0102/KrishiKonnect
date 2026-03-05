'use client'

import { memo, useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

interface MandiTrendPoint {
  date: string
  modalPrice: number
}

interface MandiTrendChartProps {
  crop: string
  data: MandiTrendPoint[]
}

function MandiTrendChartComponent({ data }: MandiTrendChartProps) {
  const chartData = useMemo(() => data.slice(-7), [data])

  if (!chartData.length) {
    return (
      <div className="h-20 rounded-xl bg-[#FAF3E0] border border-[#D8CFC0] flex items-center justify-center text-xs text-[#1D1D1D]/60">
        No trend data
      </div>
    )
  }

  return (
    <div className="h-20 rounded-xl bg-[#FAF3E0]/60 border border-[#D8CFC0] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="modalPrice"
            stroke="#7FB069"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(MandiTrendChartComponent)
