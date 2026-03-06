// Mandi Service - Mock data provider for crop price information

import cropsData from '@/data/crops.json'

export interface MandiPrice {
  id: string
  crop: string
  cropEn: string
  cropHi: string
  mandi: string
  mandiEn: string
  mandiHi: string
  district: string
  state: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  date: string
  trend: 'up' | 'down' | 'stable'
  unit: string
  source?: string
}

export interface PriceTrend {
  date: string
  modalPrice: number
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const KNOWN_STATES = [
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
]

const FALLBACK_MANDI_DATA: MandiPrice[] = [
  {
    id: 'local-1',
    crop: 'maize',
    cropEn: 'Maize',
    cropHi: 'मक्का',
    mandi: 'Meerut Mandi',
    mandiEn: 'Meerut Mandi',
    mandiHi: 'मेरठ मंडी',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    minPrice: 2150,
    maxPrice: 2450,
    modalPrice: 2350,
    date: '2026-03-05',
    trend: 'up',
    unit: 'quintal',
    source: 'Fallback',
  },
  {
    id: 'local-2',
    crop: 'maize',
    cropEn: 'Maize',
    cropHi: 'मक्का',
    mandi: 'Ghaziabad Mandi',
    mandiEn: 'Ghaziabad Mandi',
    mandiHi: 'गाजियाबाद मंडी',
    district: 'Ghaziabad',
    state: 'Uttar Pradesh',
    minPrice: 2100,
    maxPrice: 2350,
    modalPrice: 2280,
    date: '2026-03-05',
    trend: 'stable',
    unit: 'quintal',
    source: 'Fallback',
  },
  {
    id: 'local-3',
    crop: 'maize',
    cropEn: 'Maize',
    cropHi: 'मक्का',
    mandi: 'Noida Mandi',
    mandiEn: 'Noida Mandi',
    mandiHi: 'नोएडा मंडी',
    district: 'Gautam Buddha Nagar',
    state: 'Uttar Pradesh',
    minPrice: 2050,
    maxPrice: 2310,
    modalPrice: 2250,
    date: '2026-03-05',
    trend: 'stable',
    unit: 'quintal',
    source: 'Fallback',
  },
  {
    id: 'local-4',
    crop: 'wheat',
    cropEn: 'Wheat',
    cropHi: 'गेहूँ',
    mandi: 'Meerut Mandi',
    mandiEn: 'Meerut Mandi',
    mandiHi: 'मेरठ मंडी',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    minPrice: 2120,
    maxPrice: 2400,
    modalPrice: 2280,
    date: '2026-03-05',
    trend: 'up',
    unit: 'quintal',
    source: 'Fallback',
  },
  {
    id: 'local-5',
    crop: 'potato',
    cropEn: 'Potato',
    cropHi: 'आलू',
    mandi: 'Agra Mandi',
    mandiEn: 'Agra Mandi',
    mandiHi: 'आगरा मंडी',
    district: 'Agra',
    state: 'Uttar Pradesh',
    minPrice: 1050,
    maxPrice: 1350,
    modalPrice: 1220,
    date: '2026-03-05',
    trend: 'stable',
    unit: 'quintal',
    source: 'Fallback',
  },
  {
    id: 'local-6',
    crop: 'rice',
    cropEn: 'Rice',
    cropHi: 'धान',
    mandi: 'Karnal Mandi',
    mandiEn: 'Karnal Mandi',
    mandiHi: 'करनाल मंडी',
    district: 'Karnal',
    state: 'Haryana',
    minPrice: 2760,
    maxPrice: 2960,
    modalPrice: 2860,
    date: '2026-03-05',
    trend: 'up',
    unit: 'quintal',
    source: 'Fallback',
  },
]

// Helper functions

function slugify(value: string): string {
  return (value || '').trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function fallbackRowsForState(state: string): MandiPrice[] {
  const normalizedState = state.toLowerCase()
  const rows = FALLBACK_MANDI_DATA.filter(
    (item) => item.state.toLowerCase() === normalizedState
  )

  if (rows.length > 0) {
    return rows
  }

  return FALLBACK_MANDI_DATA
}

function toWeekdayLabel(dateText: string): string {
  const parsed = new Date(dateText)
  if (Number.isNaN(parsed.getTime())) {
    return dateText
  }
  return WEEKDAY_LABELS[parsed.getDay()]
}

function makeSyntheticTrend(basePrice: number): PriceTrend[] {
  if (basePrice <= 0) return []

  const points = [-120, -90, -70, -50, -30, -15, 0]
  const today = new Date()

  return points.map((offset, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return {
      date: WEEKDAY_LABELS[date.getDay()],
      modalPrice: Math.max(basePrice + offset, 1),
    }
  })
}

/**
 * Fetch mandi prices from mock data
 * @param state The state to filter prices for (optional)
 * @param limit Not used - kept for API compatibility
 * @returns Array of mandi prices
 */
export async function fetchMandiPrices(
  state?: string,
  limit?: number
): Promise<MandiPrice[]> {
  if (!state) {
    return FALLBACK_MANDI_DATA
  }

  const stateKey = state.trim()
  if (!stateKey) {
    return FALLBACK_MANDI_DATA
  }

  return fallbackRowsForState(stateKey)
}

/**
 * Fetch mandi prices with cache support
 * Note: Caching is not needed for mock data, but kept for API compatibility
 * @param state The state to fetch prices for
 * @param limit Not used - kept for API compatibility
 * @param onFresh Not used - kept for API compatibility
 * @returns Mock mandi price data
 */
export async function fetchMandiPricesWithCache(
  state?: string,
  limit?: number,
  onFresh?: (data: MandiPrice[]) => void
): Promise<MandiPrice[]> {
  return fetchMandiPrices(state, limit)
}

export async function fetchPricesByCrop(
  cropId: string,
  state?: string
): Promise<MandiPrice[]> {
  if (!cropId) return []
  const rows = await fetchMandiPrices(state)
  return rows.filter((row) => row.crop === cropId.toLowerCase())
}

export async function fetchPricesByLocation(
  state?: string,
  district?: string
): Promise<MandiPrice[]> {
  const rows = await fetchMandiPrices(state)

  if (!district) return rows

  const districtLower = district.toLowerCase()
  return rows.filter((row) => row.district.toLowerCase() === districtLower)
}

export function groupPricesByCommodity(prices: MandiPrice[]): Record<string, MandiPrice[]> {
  return prices.reduce<Record<string, MandiPrice[]>>((acc, row) => {
    if (!acc[row.crop]) {
      acc[row.crop] = []
    }
    acc[row.crop].push(row)
    return acc
  }, {})
}

export function getBestPriceFromRows(rows: MandiPrice[]): MandiPrice | null {
  if (rows.length === 0) return null

  return rows.reduce((best, current) =>
    current.modalPrice > best.modalPrice ? current : best
  )
}

export function getBestMandiForCrop(
  cropId: string,
  prices: MandiPrice[]
): MandiPrice | null {
  if (!cropId || prices.length === 0) return null

  const cropKey = cropId.toLowerCase()
  const cropPrices = prices.filter(
    (row) => row.crop.toLowerCase() === cropKey || row.cropEn.toLowerCase() === cropKey
  )
  if (cropPrices.length === 0) return null

  return cropPrices.reduce((best, current) =>
    current.modalPrice > best.modalPrice ? current : best
  )
}

export async function getBestPriceForCrop(
  cropId: string,
  state?: string
): Promise<MandiPrice | null> {
  const rows = await fetchPricesByCrop(cropId, state)
  return getBestPriceFromRows(rows)
}

export async function getBestPricesForCrops(
  cropIds: string[],
  state?: string
): Promise<Record<string, MandiPrice | null>> {
  const rows = await fetchMandiPrices(state)
  const grouped = groupPricesByCommodity(rows)

  const uniqueCropIds = [...new Set(cropIds.filter(Boolean))]
  const result: Record<string, MandiPrice | null> = {}

  for (const cropId of uniqueCropIds) {
    result[cropId] = getBestPriceFromRows(grouped[cropId] || [])
  }

  return result
}

export async function getNearbyMandis(
  state?: string,
  district?: string
): Promise<string[]> {
  const rows = await fetchPricesByLocation(state, district)
  return [...new Set(rows.map((row) => row.mandiEn))]
}

export async function fetchCropPriceHistory(
  cropId: string,
  state?: string
): Promise<PriceTrend[]> {
  if (!cropId) return []

  const rows = await fetchPricesByCrop(cropId, state)
  if (rows.length === 0) return []

  const history = rows
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map((row) => ({
      date: toWeekdayLabel(row.date),
      modalPrice: row.modalPrice,
    }))

  if (history.length >= 3) {
    return history
  }

  const best = getBestPriceFromRows(rows)
  return makeSyntheticTrend(best?.modalPrice || 0)
}

export async function getPriceTrend(cropId: string): Promise<PriceTrend[]> {
  return fetchCropPriceHistory(cropId)
}

export async function getAllStates(): Promise<string[]> {
  const dynamicStates = [...new Set(FALLBACK_MANDI_DATA.map((row) => row.state))]
  return [...new Set([...KNOWN_STATES, ...dynamicStates])].sort()
}

export async function getAllDistricts(): Promise<string[]> {
  const rows = FALLBACK_MANDI_DATA
  return [...new Set(rows.map((row) => row.district))].sort()
}

export async function getDistrictsByState(state: string): Promise<string[]> {
  if (!state) return []
  const rows = await fetchMandiPrices(state)
  return [...new Set(rows.map((row) => row.district))].sort()
}

export function searchCrops<T extends { name_en?: string; name_hi?: string }>(
  searchTerm: string,
  data: T[]
): T[] {
  const term = searchTerm.toLowerCase().trim()
  if (!term) return data

  return data.filter((item) => {
    const nameEn = (item.name_en || '').toLowerCase()
    const nameHi = (item.name_hi || '').toLowerCase()
    return nameEn.includes(term) || nameHi.includes(term)
  })
}
