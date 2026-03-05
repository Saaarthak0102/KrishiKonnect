'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import MyCropsWithPrices from '@/components/MyCropsWithPrices'
import { getTransportBookings, type TransportBookingRecord } from '@/lib/transportBookings'

export default function DashboardPage() {
  const router = useRouter()
  const { user, farmerProfile, loading } = useAuth()
  const { lang } = useLanguage()
  const { starredCrops } = useStarredCrops()
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [transportBookings, setTransportBookings] = useState<TransportBookingRecord[]>([])

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

  // Load transport bookings only once on mount.
  useEffect(() => {
    setTransportBookings(getTransportBookings())
  }, [])

  const latestTransportBookings = useMemo(
    () => transportBookings.filter((booking) => booking.type === 'transport').slice(0, 3),
    [transportBookings]
  )

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-krishi-bg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-krishi-primary border-t-krishi-heading"></div>
          <p className="mt-4 text-krishi-text">{lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
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
      weatherToday: 'आज का मौसम',
      temperature: 'तापमान',
      rainChance: 'बारिश की संभावना',
      humidity: 'नमी',
      wind: 'हवा',
      recentServices: 'हाल की सेवाएं',
      yourServices: 'आपकी सेवाएं',
      myCrops: 'मेरी फसलें',
      transportPickup: 'परिवहन पिकअप',
      transportBooked: 'परिवहन बुक किया गया',
      status: 'स्थिति',
      confirmed: 'पुष्टि की गई',
      pickupTime: 'पिकअप समय',
      pickupDate: 'पिकअप',
      provider: 'प्रदाता',
      cost: 'लागत',
      viewReceipt: 'रसीद देखें',
      noServices: 'अभी तक कोई परिवहन बुकिंग नहीं है। मंडी से परिवहन बुक करें।',
      tomorrow: 'कल',
      communityActivity: 'समुदाय गतिविधि',
      replies: 'उत्तर',
      responsesOnQuestion: 'आपके प्रश्न पर प्रतिक्रियाएं',
      aiAdvisor: 'AI सलाहकार',
      lastAdvice: 'अंतिम सलाह',
      fertilizerRecommendation: 'उर्वरक सिफारिश',
      days: 'दिन',
      rising: 'बढ़ रहा है ↑',
      falling: 'गिर रहा है ↓',
      stable: 'स्थिर →',
      quintal: 'क्विंटल',
    },
    en: {
      farmOverview: 'Farm Overview',
      primaryCrop: 'Primary Crop',
      location: 'Location',
      season: 'Season',
      marketTrend: 'Market Trend',
      estimatedHarvest: 'Estimated Harvest',
      weatherToday: 'Weather Today',
      temperature: 'Temperature',
      rainChance: 'Rain Chance',
      humidity: 'Humidity',
      wind: 'Wind',
      recentServices: 'Recent Services',
      yourServices: 'Your Services',
      myCrops: 'My Crops',
      transportPickup: 'Transport Pickup',
      transportBooked: 'Transport Booked',
      status: 'Status',
      confirmed: 'Confirmed',
      pickupTime: 'Pickup Time',
      pickupDate: 'Pickup',
      provider: 'Provider',
      cost: 'Cost',
      viewReceipt: 'View Receipt',
      noServices: 'No transport bookings yet. Book transport from mandi flow.',
      tomorrow: 'Tomorrow',
      communityActivity: 'Community Activity',
      replies: 'Replies',
      responsesOnQuestion: 'responses on your question',
      aiAdvisor: 'AI Advisor',
      lastAdvice: 'Last Advice',
      fertilizerRecommendation: 'Fertilizer recommendation',
      days: 'days',
      rising: 'Rising ↑',
      falling: 'Falling ↓',
      stable: 'Stable →',
      quintal: 'quintal',
    },
  }

  const t = translations[lang]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Row 1 - Farm Overview Card (Full Width) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-2xl font-bold text-krishi-heading mb-6 flex items-center gap-2">
          <span>🌾</span>
          {t.farmOverview}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1 - Crop & Location */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span>🌾</span>
                {t.primaryCrop}
              </p>
              <p className="text-lg font-semibold text-krishi-heading">
                {farmerProfile.primaryCrop}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span>📍</span>
                {t.location}
              </p>
              <p className="text-lg font-semibold text-krishi-heading">
                {farmerProfile.village}, {farmerProfile.state}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span>📅</span>
                {t.season}
              </p>
              <p className="text-lg font-semibold text-krishi-heading">
                Rabi
              </p>
            </div>
          </div>

          {/* Column 2 - Market Trend */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span>📈</span>
                {t.marketTrend}
              </p>
              <p className="text-lg font-semibold text-[#7FB069]">
                {t.rising}
              </p>
            </div>
          </div>

          {/* Column 3 - Harvest Info */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#FAF3E0] to-[#F5E6D3] rounded-lg p-4 border border-[#B85C38]/20">
              <p className="text-sm text-gray-600 mb-2">
                {t.estimatedHarvest}
              </p>
              <p className="text-3xl font-bold text-[#1F3C88]">
                38 <span className="text-lg font-normal">{t.days}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 3 - Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-bold text-krishi-heading mb-4 flex items-center gap-2">
          🌤 {t.weatherToday}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">{t.temperature}</p>
            <p className="text-2xl font-bold text-[#B85C38]">28°C</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t.rainChance}</p>
            <p className="text-2xl font-bold text-[#1F3C88]">20%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t.humidity}</p>
            <p className="text-2xl font-bold text-[#7FB069]">65%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t.wind}</p>
            <p className="text-2xl font-bold text-gray-700">10 km/h</p>
          </div>
        </div>
      </motion.div>

      {/* Row 4 - Two Column Layout: My Crops (Left) & Your Services (Right) */}
      <div className="dashboard-sections">
        {/* Left Column - My Crops with Mandi Prices */}
        <MyCropsWithPrices
          primaryCrop={farmerProfile.primaryCrop.toLowerCase()}
          starredCrops={starredCrops}
        />

        {/* Right Column - Your Services Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-bold text-krishi-heading mb-4 flex items-center gap-2">
            🚚 {t.yourServices}
          </h3>
        
        <div className="space-y-4">
          {latestTransportBookings.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              {t.noServices}
            </p>
          ) : (
            latestTransportBookings.map((booking) => (
              <div key={booking.id} className="p-4 bg-[#FAF3E0]/50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚚</span>
                  <div className="flex-1">
                    <p className="font-semibold text-krishi-heading mb-1">
                      {t.transportBooked}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">ID: {booking.id}</p>
                    <p className="text-sm text-gray-700 mb-1">
                      {booking.crop} {'→'} {booking.destinationMandi}
                    </p>
                    <p className="text-sm text-gray-600">{t.pickupDate}: {booking.pickupDate}</p>
                    <p className="text-sm text-gray-600">{t.provider}: {booking.provider}</p>
                    <p className="text-sm text-gray-600">{t.cost}: ₹{booking.cost.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600 mb-3">
                      {t.status}: <span className="text-[#7FB069] font-semibold">{t.confirmed}</span>
                    </p>

                    <button
                      onClick={() => router.push(`/transport?bookingId=${booking.id}`)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: '#1F3C88' }}
                    >
                      {t.viewReceipt}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </motion.div>
      </div>
    </div>
  )
}
