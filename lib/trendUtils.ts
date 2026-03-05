/**
 * Trend utility functions
 * Centralized logic for handling price trend colors and calculations
 */

/**
 * Get color code for a trend direction
 * @param trend - 'up', 'down', or 'stable'
 * @returns Hex color code
 */
export const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return '#7FB069' // Green
    case 'down':
      return '#B85C38' // Orange/Brown
    case 'stable':
      return '#F2A541' // Amber
    default:
      return '#F2A541' // Fallback to amber
  }
}

/**
 * Get Tailwind CSS class for trend color text
 * @param trend - 'up', 'down', or 'stable'
 * @returns Tailwind text color class
 */
export const getTrendColorClass = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'text-[#7FB069]'
    case 'down':
      return 'text-[#B85C38]'
    case 'stable':
      return 'text-gray-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * Get Tailwind CSS class for trend background color
 * @param trend - 'up', 'down', or 'stable'
 * @returns Tailwind background color class
 */
export const getTrendBgColorClass = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'bg-[#7FB069]/10'
    case 'down':
      return 'bg-[#B85C38]/10'
    case 'stable':
      return 'bg-gray-100'
    default:
      return 'bg-gray-100'
  }
}

/**
 * Get trend label text
 * @param trend - 'up', 'down', or 'stable'
 * @returns Display text for the trend
 */
export const getTrendLabel = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'Price increasing'
    case 'down':
      return 'Price decreasing'
    case 'stable':
      return 'Price stable'
    default:
      return 'Trend unavailable'
  }
}

/**
 * Get trend emoji/icon representation
 * @param trend - 'up', 'down', or 'stable'
 * @returns Unicode icon
 */
export const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    case 'stable':
      return '→'
    default:
      return '—'
  }
}

interface WeeklyHistoryPoint {
  modalPrice: number
}

export interface WeeklyDirectionResult {
  direction: 'up' | 'down' | 'stable'
  label: string
  averageChange: number
}

export function calculateWeeklyDirection(
  history: WeeklyHistoryPoint[]
): WeeklyDirectionResult {
  if (history.length < 2) {
    return {
      direction: 'stable',
      label: 'Market Stable →',
      averageChange: 0,
    }
  }

  let upDays = 0
  let downDays = 0
  let totalPctChange = 0

  for (let i = 1; i < history.length; i += 1) {
    const prev = history[i - 1].modalPrice
    const curr = history[i].modalPrice

    if (curr > prev) upDays += 1
    if (curr < prev) downDays += 1

    if (prev > 0) {
      totalPctChange += ((curr - prev) / prev) * 100
    }
  }

  if (upDays > downDays) {
    return {
      direction: 'up',
      label: 'Market Rising ↑',
      averageChange: totalPctChange / (history.length - 1),
    }
  }

  if (downDays > upDays) {
    return {
      direction: 'down',
      label: 'Market Falling ↓',
      averageChange: totalPctChange / (history.length - 1),
    }
  }

  return {
    direction: 'stable',
    label: 'Market Stable →',
    averageChange: totalPctChange / (history.length - 1),
  }
}
