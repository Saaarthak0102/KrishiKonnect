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
