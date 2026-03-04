'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user, farmerProfile, loading } = useAuth()
  const { lang } = useLanguage()

  // Handle redirect in useEffect to avoid React render phase error
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

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

  const translations = {
    hi: {
      farmOverview: 'कृषि सारांश',
      primaryCrop: 'मुख्य फसल',
      location: 'स्थान',
      season: 'मौसम',
      latestMandiPrice: 'नवीनतम मंडी भाव',
      marketTrend: 'बाजार रुझान',
      estimatedHarvest: 'अनुमानित कटाई',
      weatherToday: 'आज का मौसम',
      temperature: 'तापमान',
      rainChance: 'बारिश की संभावना',
      humidity: 'नमी',
      wind: 'हवा',
      recentServices: 'हाल की सेवाएं',
      starredCrops: 'पसंदीदा फसलें',
      transportPickup: 'परिवहन पिकअप',
      status: 'स्थिति',
      confirmed: 'पुष्टि की गई',
      pickupTime: 'पिकअप समय',
      tomorrow: 'कल',
      communityActivity: 'समुदाय गतिविधि',
      replies: 'उत्तर',
      responsesOnQuestion: 'आपके प्रश्न पर प्रतिक्रियाएं',
      aiAdvisor: 'AI सलाहकार',
      lastAdvice: 'अंतिम सलाह',
      fertilizerRecommendation: 'उर्वरक सिफारिश',
      days: 'दिन',
      rising: 'बढ़ रहा है',
      quintal: 'क्विंटल',
    },
    en: {
      farmOverview: 'Farm Overview',
      primaryCrop: 'Primary Crop',
      location: 'Location',
      season: 'Season',
      latestMandiPrice: 'Latest Mandi Price',
      marketTrend: 'Market Trend',
      estimatedHarvest: 'Estimated Harvest',
      weatherToday: 'Weather Today',
      temperature: 'Temperature',
      rainChance: 'Rain Chance',
      humidity: 'Humidity',
      wind: 'Wind',
      recentServices: 'Recent Services',
      starredCrops: 'Starred Crops',
      transportPickup: 'Transport Pickup',
      status: 'Status',
      confirmed: 'Confirmed',
      pickupTime: 'Pickup Time',
      tomorrow: 'Tomorrow',
      communityActivity: 'Community Activity',
      replies: 'Replies',
      responsesOnQuestion: 'responses on your question',
      aiAdvisor: 'AI Advisor',
      lastAdvice: 'Last Advice',
      fertilizerRecommendation: 'Fertilizer recommendation',
      days: 'days',
      rising: 'Rising',
      quintal: 'quintal',
    },
  }

  const t = translations[lang]

  // Sample data for starred crops
  const starredCrops = [
    { name: lang === 'hi' ? 'गेहूं' : 'Wheat', name_en: 'Wheat', price: 2350, trend: 2.3 },
    { name: lang === 'hi' ? 'मक्का' : 'Maize', name_en: 'Maize', price: 2100, trend: -1.1 },
    { name: lang === 'hi' ? 'मूंगफली' : 'Groundnut', name_en: 'Groundnut', price: 5200, trend: 0.8 },
  ]

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

          {/* Column 2 - Market Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {t.latestMandiPrice}
              </p>
              <p className="text-2xl font-bold text-[#7FB069]">
                ₹2,350 <span className="text-base font-normal text-gray-600">/ {t.quintal}</span>
              </p>
            </div>
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

      {/* Row 2 - Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-xl font-bold text-krishi-heading mb-4 flex items-center gap-2">
          <span>☀️</span>
          {t.weatherToday}
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

      {/* Row 3 - Two Cards Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Activity Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-bold text-krishi-heading mb-4">
            {t.recentServices}
          </h3>
          
          <div className="space-y-4">
            {/* Transport Activity */}
            <div className="p-4 bg-[#FAF3E0]/50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div className="flex-1">
                  <p className="font-semibold text-krishi-heading mb-1">
                    {t.transportPickup}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t.status}: <span className="text-[#7FB069] font-semibold">{t.confirmed}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {t.pickupTime}: {t.tomorrow} 6 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Community Activity */}
            <div className="p-4 bg-[#FAF3E0]/50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤝</span>
                <div className="flex-1">
                  <p className="font-semibold text-krishi-heading mb-1">
                    {t.communityActivity}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t.replies}: <span className="font-semibold">2</span> {t.responsesOnQuestion}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Advisor Activity */}
            <div className="p-4 bg-[#FAF3E0]/50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <p className="font-semibold text-krishi-heading mb-1">
                    {t.aiAdvisor}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t.lastAdvice}: {t.fertilizerRecommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Starred Crops Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-xl font-bold text-krishi-heading mb-4">
            {t.starredCrops}
          </h3>
          
          <div className="space-y-3">
            {starredCrops.map((crop, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-[#FAF3E0]/50 to-white rounded-lg border border-gray-200 hover:border-[#B85C38]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-krishi-heading text-lg">
                    {crop.name}
                  </p>
                  <span
                    className={`text-sm font-bold ${
                      crop.trend > 0 ? 'text-[#7FB069]' : 'text-red-500'
                    }`}
                  >
                    {crop.trend > 0 ? '↗' : '↘'} {Math.abs(crop.trend)}%
                  </span>
                </div>
                <p className="text-xl font-bold text-[#1F3C88]">
                  ₹{crop.price.toLocaleString()} <span className="text-sm font-normal text-gray-600">/ {t.quintal}</span>
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
