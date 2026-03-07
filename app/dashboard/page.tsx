'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import MarketInsightCard from '@/components/dashboard/MarketInsightCard'
import LatestCommunityQuestionCard from '@/components/dashboard/LatestCommunityQuestionCard'
import LatestAIChatCard from '@/components/dashboard/LatestAIChatCard'
import { subscribeToTransportBookings, type TransportBookingRecord } from '@/lib/transportBookings'
import { getRelativeTime, isLivePrice } from '@/lib/timeUtils'
import { getWeatherForLocation, type WeatherData } from '@/lib/weatherService'
import { fetchCropPriceHistory, getBestPriceForCrop as getBestMandiPriceFromService } from '@/lib/mandiService'
import cropsData from '@/data/crops.json'
import mandiPricesData from '@/data/mandiPrices.json'
import { GiWheat, GiPlantSeed } from 'react-icons/gi'
import { MdLocationOn, MdCalendarToday } from 'react-icons/md'
import { FiTrendingUp, FiCheckCircle } from 'react-icons/fi'
import { FaTruck } from 'react-icons/fa'
import { WiDaySunny, WiThermometer, WiRain, WiHumidity, WiStrongWind } from 'react-icons/wi'

interface BestPriceData {
  price: number
  mandi: string
  trend: 'up' | 'down' | 'stable'
  lastUpdated?: string
}

const cropDurations: Record<string, number> = {
  maize: 90,
  wheat: 120,
  rice: 120,
  cotton: 180,
  sugarcane: 365,
}

type TrendDirection = 'up' | 'down' | 'stable'

type StageRule = {
  maxDayExclusive: number
  messageEn: string
  messageHi: string
}

const cropStageRules: Record<string, StageRule[]> = {
  maize: [
    {
      maxDayExclusive: 15,
      messageEn: 'Seedling stage - maintain soil moisture',
      messageHi: 'अंकुरण चरण - मिट्टी में नमी बनाए रखें',
    },
    {
      maxDayExclusive: 45,
      messageEn: 'Vegetative growth - nitrogen fertilizer recommended',
      messageHi: 'वनस्पतिक वृद्धि - नाइट्रोजन उर्वरक की सिफारिश',
    },
    {
      maxDayExclusive: 75,
      messageEn: 'Tasseling stage - monitor pests',
      messageHi: 'टैसलिंग चरण - कीट निगरानी करें',
    },
    {
      maxDayExclusive: Number.POSITIVE_INFINITY,
      messageEn: 'Grain filling - irrigation important',
      messageHi: 'दाना भराव चरण - सिंचाई महत्वपूर्ण है',
    },
  ],
  wheat: [
    {
      maxDayExclusive: 20,
      messageEn: 'Germination stage - maintain moisture',
      messageHi: 'अंकुरण चरण - नमी बनाए रखें',
    },
    {
      maxDayExclusive: 60,
      messageEn: 'Tillering stage - apply fertilizer',
      messageHi: 'टिलरिंग चरण - उर्वरक डालें',
    },
    {
      maxDayExclusive: 90,
      messageEn: 'Heading stage - pest monitoring',
      messageHi: 'हेडिंग चरण - कीट निगरानी करें',
    },
    {
      maxDayExclusive: Number.POSITIVE_INFINITY,
      messageEn: 'Grain development stage',
      messageHi: 'दाना विकास चरण',
    },
  ],
}

function normalizeCropKey(crop: string): string {
  return crop.trim().toLowerCase()
}

function resolveCropId(crop: string): string {
  const cropKey = normalizeCropKey(crop)
  const exact = cropsData.find(
    (entry) => entry.id.toLowerCase() === cropKey || entry.name_en.toLowerCase() === cropKey
  )
  return exact?.id || cropKey
}

function parseDateInput(dateValue?: unknown): Date | null {
  if (!dateValue) return null

  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : dateValue
  }

  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    const parsed = new Date(dateValue)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof dateValue === 'object' && dateValue !== null) {
    const timestampValue = dateValue as { toDate?: () => Date; seconds?: number }

    if (typeof timestampValue.toDate === 'function') {
      const fromTimestamp = timestampValue.toDate()
      return Number.isNaN(fromTimestamp.getTime()) ? null : fromTimestamp
    }

    if (typeof timestampValue.seconds === 'number') {
      const fromSeconds = new Date(timestampValue.seconds * 1000)
      return Number.isNaN(fromSeconds.getTime()) ? null : fromSeconds
    }
  }

  return null
}

function calculateDaysSincePlanting(plantingDate?: unknown): number | null {
  const parsedPlantingDate = parseDateInput(plantingDate)
  if (!parsedPlantingDate) return null

  const now = new Date()
  const msDiff = now.getTime() - parsedPlantingDate.getTime()
  const dayDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24))
  return Math.max(dayDiff, 0)
}

function calculateHarvestDays(crop: string, plantingDate?: unknown): number | null {
  const cropId = resolveCropId(crop)
  const cropDuration = cropDurations[cropId]
  const daysSincePlanting = calculateDaysSincePlanting(plantingDate)

  if (!cropDuration || daysSincePlanting === null) {
    return null
  }

  return Math.max(cropDuration - daysSincePlanting, 0)
}

function getCropStageAdvice(crop: string, plantingDate?: unknown, lang: 'en' | 'hi' = 'en'): string[] {
  const cropId = resolveCropId(crop)
  const daysSincePlanting = calculateDaysSincePlanting(plantingDate)

  // Handle missing planting date
  if (daysSincePlanting === null) {
    return lang === 'hi'
      ? [
          'बुवाई तिथि जोड़ें',
          'फसल वृद्धि चरण ट्रैक करें',
          'व्यक्तिगत सलाह प्राप्त करें',
        ]
      : [
          'Add planting date in profile',
          'Track crop growth stages',
          'Get personalized farm advice',
        ]
  }

  // Maize-specific advice
  if (cropId === 'maize') {
    if (daysSincePlanting < 15) {
      return lang === 'hi'
        ? [
            'मिट्टी में नमी बनाए रखें',
            'अंकुरों को कीटों से बचाएं',
            'अत्यधिक सिंचाई से बचें',
          ]
        : [
            'Maintain soil moisture',
            'Protect seedlings from pests',
            'Avoid over-irrigation',
          ]
    }

    if (daysSincePlanting < 45) {
      return lang === 'hi'
        ? [
            'नाइट्रोजन उर्वरक डालें',
            'पत्तियों की वृद्धि देखें',
            'नियमित रूप से खरपतवार निकालें',
          ]
        : [
            'Apply nitrogen fertilizer',
            'Monitor leaf growth',
            'Remove weeds regularly',
          ]
    }

    if (daysSincePlanting < 75) {
      return lang === 'hi'
        ? [
            'कीट आक्रमण से सावधान रहें',
            'उचित सिंचाई सुनिश्चित करें',
            'पौधों की वृद्धि समर्थन करें',
          ]
        : [
            'Watch for pest attacks',
            'Ensure proper irrigation',
            'Support plant growth',
          ]
    }

    return lang === 'hi'
      ? [
          'अनाज भराव सिंचाई सुनिश्चित करें',
          'फंगल रोग जांच करें',
          'कटाई की योजना बनाएं',
        ]
      : [
          'Ensure grain filling irrigation',
          'Check for fungal diseases',
          'Prepare for harvest planning',
        ]
  }

  // Wheat-specific advice
  if (cropId === 'wheat') {
    if (daysSincePlanting < 20) {
      return lang === 'hi'
        ? [
            'मिट्टी में नमी बनाए रखें',
            'अंकुरण की निगरानी करें',
            'अंकुरों को कीटों से बचाएं',
          ]
        : [
            'Maintain soil moisture',
            'Monitor germination',
            'Protect seedlings from pests',
          ]
    }

    if (daysSincePlanting < 60) {
      return lang === 'hi'
        ? [
            'नाइट्रोजन उर्वरक डालें',
            'नियमित रूप से खरपतवार नियंत्रण करें',
            'पौध घनत्व की निगरानी करें',
          ]
        : [
            'Apply nitrogen fertilizer',
            'Control weeds regularly',
            'Monitor plant density',
          ]
    }

    if (daysSincePlanting < 90) {
      return lang === 'hi'
        ? [
            'रस्ट रोग की जांच करें',
            'उचित सिंचाई सुनिश्चित करें',
            'फसल की वृद्धि की निगरानी करें',
          ]
        : [
            'Inspect for rust disease',
            'Ensure proper irrigation',
            'Monitor crop growth',
          ]
    }

    return lang === 'hi'
      ? [
          'दाना विकास की निगरानी करें',
          'अतिरिक्त सिंचाई कम करें',
          'कटाई की तैयारी करें',
        ]
      : [
          'Monitor grain development',
          'Reduce excess irrigation',
          'Prepare for harvesting',
        ]
  }

  // Generic fallback for other crops
  return lang === 'hi'
    ? [
        'फसल की वृद्धि की निगरानी करें',
        'सिंचाई समय सारणी बनाए रखें',
        'पौधों का नियमित निरीक्षण करें',
      ]
    : [
        'Monitor crop growth',
        'Maintain irrigation schedule',
        'Inspect plants regularly',
      ]
}

async function getBestMandiPrice(crop: string, state?: string) {
  const cropId = resolveCropId(crop)
  return getBestMandiPriceFromService(cropId, state)
}

async function getMarketTrend(crop: string, state?: string): Promise<TrendDirection> {
  const cropId = resolveCropId(crop)
  if (!cropId) return 'stable'

  const history = await fetchCropPriceHistory(cropId, state)

  if (history.length >= 2) {
    const todayPrice = history[history.length - 1].modalPrice
    const yesterdayPrice = history[history.length - 2].modalPrice

    if (todayPrice > yesterdayPrice) return 'up'
    if (todayPrice < yesterdayPrice) return 'down'
    return 'stable'
  }

  const bestPrice = await getBestMandiPrice(cropId, state)
  return bestPrice?.trend || 'stable'
}

function getSeasonForCrop(crop: string, lang: 'en' | 'hi'): string {
  const cropId = resolveCropId(crop)
  const cropMeta = cropsData.find((entry) => entry.id === cropId)
  if (!cropMeta) return 'Rabi'
  return lang === 'hi' ? cropMeta.season_hi : cropMeta.season_en
}

// Helper function to get best price for a crop from local dataset
function getBestPriceForCrop(cropId: string): BestPriceData | null {
  const crop = cropsData.find(c => c.id === cropId)
  if (!crop) return null
  
  const cropName = crop.name_en
  const cropPrices = mandiPricesData.prices.filter(
    (p: any) => p.crop.toLowerCase() === cropName.toLowerCase()
  )

  if (!cropPrices.length) return null

  // Find the entry with the highest modalPrice
  const bestPrice = cropPrices.reduce((best: any, current: any) => {
    return current.modalPrice > best.modalPrice ? current : best
  })

  return {
    price: bestPrice.modalPrice,
    mandi: bestPrice.mandi,
    trend: bestPrice.trend.direction as 'up' | 'down' | 'stable',
    lastUpdated: bestPrice.lastUpdated
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, farmerProfile, loading } = useAuth()
  const { lang } = useLanguage()
  const { starredCrops } = useStarredCrops()
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [transportBookings, setTransportBookings] = useState<TransportBookingRecord[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [marketTrend, setMarketTrend] = useState<TrendDirection>('stable')

  // Compute My Crops from starred crops
  const myCrops = useMemo(() => {
    return cropsData
      .filter(crop => starredCrops.includes(crop.id))
      .slice(0, 5) // Limit to maximum 5 crops
  }, [starredCrops])

  // Compute best prices for all starred crops (optimized with useMemo)
  const bestPrices = useMemo(() => {
    const pricesMap: Record<string, BestPriceData | null> = {}
    
    myCrops.forEach(crop => {
      pricesMap[crop.id] = getBestPriceForCrop(crop.id)
    })
    
    return pricesMap
  }, [myCrops])

  // Handle redirect in useEffect to avoid React render phase error
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Simulate dashboard data loading
  useEffect(() => {
    if (!loading && user) {
      const timer = setTimeout(() => {
        setDashboardLoading(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [loading, user])

  // Subscribe to realtime transport bookings updates
  useEffect(() => {
    if (!user?.uid) {
      setTransportBookings([])
      return
    }

    // Subscribe to realtime updates
    const unsubscribe = subscribeToTransportBookings(user.uid, (updatedBookings) => {
      setTransportBookings(updatedBookings)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user])

  // Fetch weather for the farmer's selected location with half-day cache support.
  useEffect(() => {
    if (!farmerProfile?.village || !farmerProfile?.state) {
      setWeather(null)
      return
    }

    let isMounted = true
    const location = `${farmerProfile.village}, ${farmerProfile.state}`

    getWeatherForLocation(location)
      .then((data) => {
        if (isMounted) {
          setWeather(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setWeather(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [farmerProfile?.village, farmerProfile?.state])

  // Compute market trend from latest mandi history for the primary crop.
  useEffect(() => {
    if (!farmerProfile?.primaryCrop) {
      setMarketTrend('stable')
      return
    }

    let isMounted = true

    getMarketTrend(farmerProfile.primaryCrop, farmerProfile.state)
      .then((trend) => {
        if (isMounted) {
          setMarketTrend(trend)
        }
      })
      .catch(() => {
        if (isMounted) {
          setMarketTrend('stable')
        }
      })

    return () => {
      isMounted = false
    }
  }, [farmerProfile?.primaryCrop, farmerProfile?.state])

  const latestTransportBooking = useMemo(
    () => transportBookings.length > 0 ? transportBookings[0] : null,
    [transportBookings]
  )

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-krishi-clay border-t-krishi-heading"></div>
          <p className="mt-4 text-krishi-indigo">{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </main>
    )
  }

  if (!user || !farmerProfile) {
    return null
  }

  // Show skeleton while dashboard data is loading
  if (dashboardLoading) {
    return <DashboardSkeleton />
  }

  const translations = {
    hi: {
      farmOverview: 'कृषि सारांश',
      primaryCrop: 'मुख्य फसल',
      location: 'स्थान',
      season: 'मौसम',
      marketTrend: 'बाजार रुझान',
      estimatedHarvest: 'अनुमानित कटाई',
      inYourFarmToday: 'आपके खेत में आज',
      weatherToday: 'आज का मौसम',
      temperature: 'तापमान',
      rainChance: 'बारिश की संभावना',
      humidity: 'नमी',
      wind: 'हवा',
      yourServices: 'आपकी सेवाएं',
      transportBooked: 'परिवहन बुक किया गया',
      status: 'स्थिति',
      confirmed: 'पुष्टि की गई',
      pickupDate: 'पिकअप',
      provider: 'प्रदाता',
      cost: 'लागत',
      viewReceipt: 'रसीद देखें',
      noServices: 'अभी तक कोई सक्रिय सेवा बुकिंग नहीं है।',
      days: 'दिन',
      rising: 'बढ़ रहा है ↑',
      falling: 'गिर रहा है ↓',
      stable: 'स्थिर',
      myCrops: 'मेरी फसलें',
      latestMandiPrices: 'आपकी फसलों के लिए नवीनतम कृषि बाजार भाव',
      noCropsSelected: 'अभी कोई फसल नहीं चुनी गई',
      noCropsMessage: 'बाजार सतर्कताएं और सिफारिशों तक जल्दी पहुंचने के लिए फसलें सहेजें।',
      exploreCrops: 'कृषि फसल खोजें →',
      topMandi: 'शीर्ष कृषि बाजार',
      risingTrend: 'बढ़ रहा है',
      fallingTrend: 'गिर रहा है',
      stableTrend: 'स्थिर',
    },
    en: {
      farmOverview: 'Farm Overview',
      primaryCrop: 'Primary Crop',
      location: 'Location',
      season: 'Season',
      marketTrend: 'Market Trend',
      estimatedHarvest: 'Estimated Harvest',
      inYourFarmToday: 'In Your Farm Today',
      weatherToday: 'Weather Today',
      temperature: 'Temperature',
      rainChance: 'Rain Chance',
      humidity: 'Humidity',
      wind: 'Wind',
      yourServices: 'Your Services',
      transportBooked: 'Transport Booked',
      status: 'Status',
      confirmed: 'Confirmed',
      pickupDate: 'Pickup',
      provider: 'Provider',
      cost: 'Cost',
      viewReceipt: 'View Receipt',
      noServices: 'No active service bookings yet.',
      days: 'days',
      rising: 'Rising ↑',
      falling: 'Falling ↓',
      stable: 'Stable',
      myCrops: 'My Crops',
      latestMandiPrices: 'Latest Krishi Bazaar prices for your crops',
      noCropsSelected: 'No crops selected yet',
      noCropsMessage: 'Save crops to quickly access market alerts and recommendations.',
      exploreCrops: 'Explore Krishi Fasal →',
      topMandi: 'Top Krishi Bazaar',
      risingTrend: 'Rising',
      fallingTrend: 'Falling',
      stableTrend: 'Stable',
    },
  }

  const t = translations[lang]
  const plantingDate = (farmerProfile as { plantingDate?: unknown; createdAt?: unknown }).plantingDate
    ?? (farmerProfile as { plantingDate?: unknown; createdAt?: unknown }).createdAt
  const estimatedHarvestDays = calculateHarvestDays(farmerProfile.primaryCrop, plantingDate)
  const cropAdvice = getCropStageAdvice(farmerProfile.primaryCrop, plantingDate, lang)
  const cropSeason = getSeasonForCrop(farmerProfile.primaryCrop, lang)

  const marketTrendLabel =
    marketTrend === 'up'
      ? t.rising
      : marketTrend === 'down'
        ? t.falling
        : t.stable

  const marketTrendColor =
    marketTrend === 'up'
      ? 'text-[#7FB069]'
      : marketTrend === 'down'
        ? 'text-[#B85C38]'
        : 'text-gray-600'

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Row 1 - Farm Overview Card (Full Width) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 24px rgba(196,106,61,0.18)'
        }}
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.05), 0 0 20px rgba(196,106,61,0.15)',
          border: '1px solid rgba(196,106,61,0.35)',
          transition: 'box-shadow 0.25s ease'
        }}
        className="p-6"
      >
        <h2 className="flex items-center gap-2 mb-6" style={{ color: '#2D2A6E', fontWeight: 600, fontSize: '20px' }}>
          <GiWheat size={22} style={{ color: '#2D2A6E' }} />
          {t.farmOverview}
        </h2>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Column 1 - Crop & Location */}
          <div className="space-y-4">
            <div>
              <p className="mb-1 flex items-center gap-2" style={{ fontSize: '15px', color: '#2D2A6E', opacity: 0.75 }}>
                <GiWheat size={22} style={{ color: '#2D2A6E' }} />
                {t.primaryCrop}
              </p>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#2D2A6E' }}>
                {farmerProfile.primaryCrop}
              </p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2" style={{ fontSize: '15px', color: '#2D2A6E', opacity: 0.75 }}>
                <MdLocationOn size={22} style={{ color: '#2D2A6E' }} />
                {t.location}
              </p>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#2D2A6E' }}>
                {farmerProfile.village}
              </p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2" style={{ fontSize: '15px', color: '#2D2A6E', opacity: 0.75 }}>
                <MdCalendarToday size={22} style={{ color: '#2D2A6E' }} />
                {t.season}
              </p>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#2D2A6E' }}>
                {cropSeason}
              </p>
            </div>
          </div>

          {/* Column 2 - Market Trend */}
          <div className="space-y-4">
            <div>
              <p className="mb-1 flex items-center gap-2" style={{ fontSize: '15px', color: '#2D2A6E', opacity: 0.75 }}>
                <FiTrendingUp size={22} style={{ color: '#2D2A6E' }} />
                {t.marketTrend}
              </p>
              <p style={{ fontSize: '18px', fontWeight: 600, color: '#C46A3D' }}>
                {marketTrendLabel}
              </p>
            </div>
            <div
              style={{
                background: 'rgba(196,106,61,0.12)',
                border: '1px solid rgba(196,106,61,0.35)',
                borderRadius: '12px'
              }}
              className="p-4"
            >
              <p className="mb-2" style={{ fontSize: '13px', color: '#2D2A6E', opacity: 0.7 }}>
                {t.estimatedHarvest}
              </p>
              <p style={{ fontSize: '30px', fontWeight: 700, color: '#2D2A6E' }}>
                {estimatedHarvestDays !== null ? estimatedHarvestDays : '--'}{' '}
                <span style={{ fontSize: '16px', color: '#2D2A6E' }}>{t.days}</span>
              </p>
            </div>
          </div>

          {/* Column 3 - In Your Farm Today */}
          <div className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-2" style={{ fontSize: '18px', color: '#2D2A6E', fontWeight: 600 }}>
                <GiPlantSeed size={22} style={{ color: '#2D2A6E' }} />
                {t.inYourFarmToday}
              </p>
              <ul className="mt-2 space-y-1">
                {cropAdvice.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2" style={{ fontSize: '16px', fontWeight: 500, lineHeight: '1.7', color: '#2D2A6E' }}>
                    <FiCheckCircle size={20} style={{ color: '#C46A3D', marginTop: '2px', flexShrink: 0 }} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 2 - Weather & Market Insight Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
      >
        {/* Weather Card */}
        <div className="h-full md:col-span-4">
          <motion.div
            whileHover={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 22px rgba(196,106,61,0.18)',
            }}
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(196,106,61,0.35)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.05), 0 0 18px rgba(196,106,61,0.12)',
              transition: 'all 0.25s ease',
            }}
            className="p-6 h-full flex flex-col"
          >
            <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 600, color: '#2D2A6E' }}>
              <WiDaySunny size={24} style={{ color: '#2D2A6E' }} />
              {t.weatherToday}
            </h3>
            
            <div className="grid grid-cols-2 gap-6 flex-1">
              <div>
                <p className="mb-1 flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 500, color: '#2D2A6E', opacity: 0.8 }}>
                  <WiThermometer size={32} style={{ color: '#C46A3D' }} />
                  {t.temperature}
                </p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#C46A3D' }}>
                  {weather ? `${weather.temperatureC}°C` : '--'}
                </p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 500, color: '#2D2A6E', opacity: 0.8 }}>
                  <WiRain size={32} style={{ color: '#C46A3D' }} />
                  {t.rainChance}
                </p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#2D2A6E' }}>
                  {weather ? `${weather.rainChancePercent}%` : '--'}
                </p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 500, color: '#2D2A6E', opacity: 0.8 }}>
                  <WiHumidity size={32} style={{ color: '#C46A3D' }} />
                  {t.humidity}
                </p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#2D2A6E' }}>
                  {weather ? `${weather.humidityPercent}%` : '--'}
                </p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-2" style={{ fontSize: '16px', fontWeight: 500, color: '#2D2A6E', opacity: 0.8 }}>
                  <WiStrongWind size={32} style={{ color: '#C46A3D' }} />
                  {t.wind}
                </p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#2D2A6E' }}>
                  {weather ? `${weather.windSpeedKmh} km/h` : '--'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Market Insight Card */}
        <div className="h-full md:col-span-8">
          <MarketInsightCard starredCrops={starredCrops} />
        </div>
      </motion.div>

      {/* Row 4 - Two Column Layout: My Crops (Left) & Your Services (Right) */}
      <div className="dashboard-sections">
        {/* Left Column - My Crops with Mandi Prices */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-krishi-indigo flex items-center gap-2 mb-1">
              <GiWheat size={24} className="text-krishi-agriculture" />
              {t.myCrops}
            </h2>
            <p className="text-sm text-gray-600">
              {t.latestMandiPrices}
            </p>
          </div>

          {/* Empty State */}
          {myCrops.length === 0 && (
            <div className="py-12 px-6 text-center">
              <div className="mb-4 text-5xl flex justify-center">
                <GiWheat size={64} className="text-krishi-agriculture" />
              </div>
              <h3 className="text-lg font-semibold text-krishi-indigo mb-2">
                {t.noCropsSelected}
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {t.noCropsMessage}
              </p>
              <Link
                href="/crop-library"
                className="inline-block bg-[#1F3C88] hover:bg-[#1F3C88]/80 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                {t.exploreCrops}
              </Link>
            </div>
          )}

          {/* Crops List */}
          {myCrops.length > 0 && (
            <div className="space-y-3">
              {myCrops.map((crop, index) => {
                const cropName = lang === 'hi' ? crop.name_hi : crop.name_en
                const priceData = bestPrices[crop.id]
                
                const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
                  if (trend === 'up') return '↑'
                  if (trend === 'down') return '↓'
                  return '→'
                }

                const getTrendText = (trend: 'up' | 'down' | 'stable') => {
                  if (trend === 'up') return t.risingTrend
                  if (trend === 'down') return t.fallingTrend
                  return t.stableTrend
                }

                const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
                  if (trend === 'up') return 'text-[#7FB069]'
                  if (trend === 'down') return 'text-[#B85C38]'
                  return 'text-gray-600'
                }

                return (
                  <Link
                    key={crop.id}
                    href={`/mandi?crop=${crop.id}`}
                    className="block"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-[#FAF3E0]/30 rounded-lg border border-gray-200 hover:border-[#B85C38] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-krishi-indigo mb-1">
                          {cropName}
                        </p>
                        {priceData && (
                          <p className="text-sm text-gray-600">
                            {t.topMandi}: {priceData.mandi}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {priceData ? (
                          <>
                            <p className="text-lg font-bold text-krishi-indigo">
                              ₹{priceData.price.toLocaleString()}
                            </p>
                            <p className={`text-sm font-medium ${getTrendColor(priceData.trend)}`}>
                              {getTrendIcon(priceData.trend)} {getTrendText(priceData.trend)}
                            </p>
                            {priceData.lastUpdated && (
                              <div className="flex items-center gap-1 mt-1">
                                {isLivePrice(priceData.lastUpdated) && (
                                  <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                )}
                                <p className="text-xs text-gray-500">
                                  {getRelativeTime(priceData.lastUpdated, lang === 'hi' ? 'hi' : 'en')}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">—</p>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Right Column - Your Services Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-krishi-indigo mb-4 flex items-center gap-2">
            <FaTruck size={24} />
            {t.yourServices}
          </h3>
        
        <div className="space-y-4">
          {!latestTransportBooking ? (
            <p className="text-sm text-gray-500 py-4">
              {t.noServices}
            </p>
          ) : (
            <div key={latestTransportBooking.id} className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <FaTruck size={24} className="text-gray-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-krishi-indigo mb-1">
                    {t.transportBooked}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">ID: {latestTransportBooking.id}</p>
                  <p className="text-sm text-gray-700 mb-1">
                    {latestTransportBooking.crop} {'→'} {latestTransportBooking.destinationMandi}
                  </p>
                  <p className="text-sm text-gray-600">{t.pickupDate}: {latestTransportBooking.pickupDate}</p>
                  <p className="text-sm text-gray-600">{t.provider}: {latestTransportBooking.provider}</p>
                  <p className="text-sm text-gray-600">{t.cost}: ₹{latestTransportBooking.cost.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-600 mb-3">
                    {t.status}: <span className="text-[#7FB069] font-semibold">{t.confirmed}</span>
                  </p>

                  <button
                    onClick={() => router.push(`/transport?bookingId=${latestTransportBooking.id}`)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: '#1F3C88' }}
                  >
                    {t.viewReceipt}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          {latestTransportBooking && (
            <div className="border-t border-gray-200 my-2"></div>
          )}

          {/* Latest Community Question Card */}
          <LatestCommunityQuestionCard 
            farmerName={farmerProfile?.name || 'Ramesh Singh'}
            lang={lang as 'en' | 'hi'}
          />

          <LatestAIChatCard
            userId={user.uid}
            lang={lang as 'en' | 'hi'}
          />
        </div>
        </motion.div>
      </div>


    </div>
  )
}
