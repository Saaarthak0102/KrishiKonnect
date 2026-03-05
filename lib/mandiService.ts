// Mandi Service - crop-first Agmarknet integration with state-level caching

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

interface AgmarknetApiResponse {
  records?: Record<string, string>[]
}

interface StateCacheEntry {
  data: MandiPrice[]
  timestamp: number
}

const AGMARKNET_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'
const AGMARKNET_BASE_URL = 'https://api.data.gov.in/resource'
const DEFAULT_FETCH_LIMIT = 500
const CACHE_TTL_MS = 5 * 60 * 1000
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DATA_GOV_API_KEY =
  process.env.NEXT_PUBLIC_DATA_GOV_API_KEY ||
  '579b464db66ec23bdd000001e2f8fdd6e6d7a3d7403f38f'

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

const stateCache: Partial<Record<string, StateCacheEntry>> = {}
const inFlightRequests: Partial<Record<string, Promise<MandiPrice[]>>> = {}

// localStorage Cache Configuration
const MANDI_CACHE_KEY = 'mandi_prices_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface LocalStorageCachePayload {
  state: string
  data: MandiPrice[]
  timestamp: number
}

/**
 * Save mandi price data to localStorage with timestamp
 * @param state The state to cache data for
 * @param data Array of mandi price records
 */
function saveMandiCache(state: string, data: MandiPrice[]): void {
  try {
    if (typeof window === 'undefined') return // Not in browser

    const cachePayload: LocalStorageCachePayload = {
      state,
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(MANDI_CACHE_KEY, JSON.stringify(cachePayload))
  } catch (error) {
    // Silently fail if localStorage is unavailable
    console.debug('Failed to save mandi cache:', error)
  }
}

/**
 * Load mandi price data from localStorage if it exists and is valid
 * @param state The state to verify the cache matches
 * @returns Cached mandi price data or null if cache is invalid/expired
 */
function loadMandiCache(state: string): MandiPrice[] | null {
  try {
    if (typeof window === 'undefined') return null // Not in browser

    const cached = localStorage.getItem(MANDI_CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached) as LocalStorageCachePayload

    // Verify this cache is for the requested state
    if (parsed.state !== state) return null

    // Check if cache has expired
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION
    if (isExpired) return null

    return parsed.data
  } catch (error) {
    // Silently fail if cache is corrupted
    console.debug('Failed to load mandi cache:', error)
    return null
  }
}

function normalizeText(value: string | undefined | null): string {
  return (value || '').trim()
}

function slugify(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeCropId(commodity: string): string {
  const normalized = slugify(commodity)
  if (!normalized) return ''

  const exactIdMatch = cropsData.find((crop) => crop.id.toLowerCase() === normalized)
  if (exactIdMatch) return exactIdMatch.id

  const byEnglishName = cropsData.find(
    (crop) => slugify(crop.name_en) === normalized
  )

  if (byEnglishName) return byEnglishName.id

  return normalized
}

function parsePrice(value: string | undefined): number {
  const parsed = Number.parseFloat((value || '').replace(/,/g, ''))
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function parseDate(value: string | undefined): string {
  const raw = normalizeText(value)
  if (!raw) return new Date().toISOString().slice(0, 10)

  const normalized = raw.includes('/') ? raw.split('/').reverse().join('-') : raw
  const parsed = new Date(normalized)

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }

  return parsed.toISOString().slice(0, 10)
}

function getCropNames(cropId: string, commodity: string): { cropEn: string; cropHi: string } {
  const fromCatalog = cropsData.find((crop) => crop.id === cropId)
  if (fromCatalog) {
    return {
      cropEn: fromCatalog.name_en,
      cropHi: fromCatalog.name_hi,
    }
  }

  return {
    cropEn: commodity,
    cropHi: commodity,
  }
}

function mapAgmarknetRecordToPrice(
  row: Record<string, string>,
  index: number,
  requestedState: string
): MandiPrice | null {
  const commodity = normalizeText(row.commodity)
  const market = normalizeText(row.market)
  const state = normalizeText(row.state) || requestedState

  if (!commodity || !market || !state) {
    return null
  }

  const cropId = normalizeCropId(commodity)
  if (!cropId) {
    return null
  }

  const { cropEn, cropHi } = getCropNames(cropId, commodity)
  const minPrice = parsePrice(row.min_price)
  const maxPrice = parsePrice(row.max_price)
  const modalPrice = parsePrice(row.modal_price)

  return {
    id: `${slugify(state)}-${slugify(market)}-${cropId}-${index}`,
    crop: cropId,
    cropEn,
    cropHi,
    mandi: market,
    mandiEn: market,
    mandiHi: market,
    district: normalizeText(row.district) || state,
    state,
    minPrice,
    maxPrice,
    modalPrice,
    date: parseDate(row.arrival_date),
    trend: 'stable',
    unit: 'quintal',
    source: 'Agmarknet',
  }
}

function dedupeMandiRows(rows: MandiPrice[]): MandiPrice[] {
  const bucket = new Map<string, MandiPrice>()

  for (const row of rows) {
    const key = `${row.crop}-${row.mandiEn}-${row.date}`.toLowerCase()
    const existing = bucket.get(key)
    if (!existing || row.modalPrice > existing.modalPrice) {
      bucket.set(key, row)
    }
  }

  return Array.from(bucket.values())
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

function buildAgmarknetUrl(state: string, limit: number): string {
  const url = new URL(`${AGMARKNET_BASE_URL}/${AGMARKNET_RESOURCE_ID}`)
  url.searchParams.set('api-key', DATA_GOV_API_KEY)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('offset', '0')
  url.searchParams.set('filters[state]', state)
  return url.toString()
}

function isCacheFresh(entry?: StateCacheEntry): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL_MS
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

export async function fetchMandiPrices(
  state?: string,
  limit: number = DEFAULT_FETCH_LIMIT
): Promise<MandiPrice[]> {
  if (!state) {
    return FALLBACK_MANDI_DATA
  }

  const stateKey = state.trim()
  if (!stateKey) {
    return FALLBACK_MANDI_DATA
  }

  const cached = stateCache[stateKey]
  if (cached && isCacheFresh(cached)) {
    return cached.data
  }

  if (inFlightRequests[stateKey]) {
    return inFlightRequests[stateKey]
  }

  inFlightRequests[stateKey] = (async () => {
    try {
      const response = await fetch(buildAgmarknetUrl(stateKey, limit), {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Agmarknet request failed with status ${response.status}`)
      }

      const payload = (await response.json()) as AgmarknetApiResponse
      const mappedRows = (payload.records || [])
        .map((row, index) => mapAgmarknetRecordToPrice(row, index, stateKey))
        .filter((row): row is MandiPrice => Boolean(row))

      const normalizedRows = dedupeMandiRows(mappedRows)
      const rowsToUse = normalizedRows.length > 0 ? normalizedRows : fallbackRowsForState(stateKey)

      stateCache[stateKey] = {
        data: rowsToUse,
        timestamp: Date.now(),
      }

      return rowsToUse
    } catch (error) {
      console.error('Error fetching mandi prices:', error)
      const fallbackRows = fallbackRowsForState(stateKey)

      stateCache[stateKey] = {
        data: fallbackRows,
        timestamp: Date.now(),
      }

      return fallbackRows
    } finally {
      delete inFlightRequests[stateKey]
    }
  })()

  return inFlightRequests[stateKey]
}

/**
 * Fetch mandi prices with localStorage caching and background refresh.
 * Returns cached data immediately, then fetches fresh data in background.
 * Best used with callbacks to update UI when fresh data arrives.
 * @param state The state to fetch prices for
 * @param limit The number of records to fetch
 * @param onFresh Callback invoked when fresh data is fetched (for background updates)
 * @returns Cached data immediately, fresh data via onFresh callback
 */
export async function fetchMandiPricesWithCache(
  state?: string,
  limit: number = DEFAULT_FETCH_LIMIT,
  onFresh?: (data: MandiPrice[]) => void
): Promise<MandiPrice[]> {
  if (!state) {
    return FALLBACK_MANDI_DATA
  }

  const stateKey = state.trim()
  if (!stateKey) {
    return FALLBACK_MANDI_DATA
  }

  // Try to load from localStorage first
  const cachedData = loadMandiCache(stateKey)
  if (cachedData) {
    // If we have cached data, fetch fresh data in background
    fetchMandiPrices(stateKey, limit)
      .then((freshData) => {
        saveMandiCache(stateKey, freshData)
        if (onFresh) {
          onFresh(freshData)
        }
      })
      .catch((error) => {
        console.debug('Background mandi fetch failed:', error)
      })

    // Return cached data immediately
    return cachedData
  }

  // No cache exists, fetch from API and save to cache
  try {
    const freshData = await fetchMandiPrices(stateKey, limit)
    saveMandiCache(stateKey, freshData)
    return freshData
  } catch (error) {
    console.error('Failed to fetch mandi prices:', error)
    return fallbackRowsForState(stateKey)
  }
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

export function clearMandiStateCache(): void {
  for (const key of Object.keys(stateCache)) {
    delete stateCache[key]
  }
}
