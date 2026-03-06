export interface WeatherData {
  temperatureC: number
  rainChancePercent: number
  humidityPercent: number
  windSpeedKmh: number
}

interface WeatherCacheEntry {
  location: string
  windowKey: string
  timestamp: number
  data: WeatherData
}

const WEATHER_CACHE_KEY = 'dashboard_weather_cache_v1'

function normalizeLocation(location: string): string {
  return location.trim().toLowerCase()
}

function getHalfDayWindow(date = new Date()): 'morning' | 'evening' {
  return date.getHours() < 12 ? 'morning' : 'evening'
}

function getWindowKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const half = getHalfDayWindow(date)
  return `${year}-${month}-${day}-${half}`
}

function readCache(): WeatherCacheEntry | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as WeatherCacheEntry
    if (!parsed || !parsed.location || !parsed.windowKey || !parsed.data) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function writeCache(entry: WeatherCacheEntry): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Ignore cache write failures in private browsing/storage-restricted environments.
  }
}

function getCachedForCurrentWindow(location: string): WeatherData | null {
  const cache = readCache()
  if (!cache) return null

  const normalized = normalizeLocation(location)
  const currentWindowKey = getWindowKey()

  if (cache.location === normalized && cache.windowKey === currentWindowKey) {
    return cache.data
  }

  return null
}

function getLastCachedForLocation(location: string): WeatherData | null {
  const cache = readCache()
  if (!cache) return null

  if (cache.location === normalizeLocation(location)) {
    return cache.data
  }

  return null
}

async function fetchFromOpenWeather(location: string): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY
  if (!apiKey) {
    throw new Error('Weather API key is not configured')
  }

  const query = encodeURIComponent(location)
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric`

  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Weather API request failed with status ${response.status}`)
  }

  const payload = await response.json()
  const firstForecast = payload?.list?.[0]

  if (!firstForecast?.main || !firstForecast?.wind) {
    throw new Error('Weather API payload missing expected fields')
  }

  const temp = Number(firstForecast.main.temp)
  const humidity = Number(firstForecast.main.humidity)
  const pop = Number(firstForecast.pop ?? 0)
  const windMs = Number(firstForecast.wind.speed)

  if ([temp, humidity, pop, windMs].some((v) => Number.isNaN(v))) {
    throw new Error('Weather API payload contains invalid numeric values')
  }

  return {
    temperatureC: Math.round(temp),
    rainChancePercent: Math.round(Math.max(0, Math.min(1, pop)) * 100),
    humidityPercent: Math.round(humidity),
    windSpeedKmh: Math.round(windMs * 3.6),
  }
}

export async function getWeatherForLocation(location: string): Promise<WeatherData | null> {
  const trimmedLocation = location.trim()
  if (!trimmedLocation) return null

  const windowCached = getCachedForCurrentWindow(trimmedLocation)
  if (windowCached) {
    return windowCached
  }

  try {
    const freshData = await fetchFromOpenWeather(trimmedLocation)

    writeCache({
      location: normalizeLocation(trimmedLocation),
      windowKey: getWindowKey(),
      timestamp: Date.now(),
      data: freshData,
    })

    return freshData
  } catch {
    const lastCached = getLastCachedForLocation(trimmedLocation)
    return lastCached
  }
}
