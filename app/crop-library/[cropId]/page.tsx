'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Footer from '@/components/Footer'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import Toast from '@/components/Toast'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import Link from 'next/link'
import cropsData from '@/data/crops.json'

// Helper function to get badge color based on season
const getSeasonBadgeClass = (season: string) => {
  if (season === 'Rabi') return 'bg-[#7FB069] text-white'
  if (season === 'Kharif') return 'bg-[#F2A541] text-white'
  if (season === 'Zaid') return 'bg-[#B85C38] text-white'
  if (season === 'Year-round') return 'bg-[#1F3C88] text-white'
  return 'bg-[#D8CFC0] text-[#1D1D1D]'
}

export default function CropDetailPage() {
  const params = useParams() as { cropId: string }
  const { lang } = useLanguage()
  const { isStarred, toggleStar } = useStarredCrops()
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const cropId = params.cropId

  // Find crop data
  const crop = useMemo(() => {
    return cropsData.find((c) => c.id === cropId)
  }, [cropId])

  const handleStarClick = async () => {
    const result = await toggleStar(cropId)
    setToastMessage(result.message || '')
    setShowToast(true)
  }

  if (!crop) {
    return (
      <FeaturePageLayout>
        <div className="relative min-h-screen">
          <main className="container mx-auto px-4 py-16">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-krishi-heading mb-4">
                {lang === 'hi' ? 'फसल नहीं मिली' : 'Crop Not Found'}
              </h1>
              <p className="text-krishi-text mb-6">
                {lang === 'hi'
                  ? 'यह फसल उपलब्ध नहीं है।'
                  : 'This crop is not available.'}
              </p>
              <Link
                href="/crop-library"
                className="inline-block bg-krishi-primary text-white px-6 py-2 rounded-lg hover:bg-krishi-primary/90 transition-colors"
              >
                {lang === 'hi' ? 'वापस जाएं' : 'Go Back'}
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </FeaturePageLayout>
    )
  }

  // Get language-specific content
  const cropName = lang === 'hi' ? crop.name_hi : crop.name_en
  const seasonName = lang === 'hi' ? crop.season_hi : crop.season_en
  const basicInfo = lang === 'hi' ? crop.basic_hi : crop.basic_en
  const soilInfo = lang === 'hi' ? crop.soil_hi : crop.soil_en
  const climateInfo = lang === 'hi' ? crop.climate_hi : crop.climate_en
  const sowingInfo = lang === 'hi' ? crop.sowing_hi : crop.sowing_en
  const irrigationInfo = lang === 'hi' ? crop.irrigation_hi : crop.irrigation_en
  const fertilizerInfo = lang === 'hi' ? crop.fertilizer_hi : crop.fertilizer_en
  const pestsInfo = lang === 'hi' ? crop.pests_hi : crop.pests_en
  const yieldInfo = lang === 'hi' ? crop.yield_hi : crop.yield_en

  // Information sections with icons
  const sections = [
    {
      title: lang === 'hi' ? 'मूल जानकारी' : 'Basic Info',
      content: basicInfo,
      icon: '🌱',
    },
    {
      title: lang === 'hi' ? 'मिट्टी' : 'Soil',
      content: soilInfo,
      icon: '🌍',
    },
    {
      title: lang === 'hi' ? 'जलवायु' : 'Climate',
      content: climateInfo,
      icon: '☀️',
    },
    {
      title: lang === 'hi' ? 'बुवाई का समय' : 'Sowing Time',
      content: sowingInfo,
      icon: '📅',
    },
    {
      title: lang === 'hi' ? 'सिंचाई' : 'Irrigation',
      content: irrigationInfo,
      icon: '💧',
    },
    {
      title: lang === 'hi' ? 'उर्वरक' : 'Fertilizer',
      content: fertilizerInfo,
      icon: '🧪',
    },
    {
      title: lang === 'hi' ? 'कीट / रोग' : 'Pests & Diseases',
      content: pestsInfo,
      icon: '🐛',
    },
    {
      title: lang === 'hi' ? 'अपेक्षित उपज' : 'Expected Yield',
      content: yieldInfo,
      icon: '🎯',
    },
  ]

  return (
    <FeaturePageLayout>
      <div className="relative min-h-screen">
        <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/crop-library"
          className="inline-flex items-center text-krishi-primary hover:text-krishi-primary/80 transition-colors mb-8 font-semibold"
        >
          <span className="mr-2">←</span>
          {lang === 'hi' ? 'वापस जाएं' : 'Back to Library'}
        </Link>

        {/* Crop Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border-2 border-krishi-border rounded-lg overflow-hidden shadow-md mb-12"
        >
          {/* Crop Image */}
          <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-krishi-agriculture to-krishi-primary overflow-hidden">
            <img
              src={crop.image}
              alt={cropName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-krishi-agriculture/80 to-krishi-primary/80 flex items-center justify-center text-8xl font-bold opacity-0 hover:opacity-100 transition-opacity">
              {cropName.charAt(0)}
            </div>
          </div>

          {/* Crop Info */}
          <div className="p-8 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            {/* Left Side - Crop Details */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-krishi-heading">
                  {cropName}
                </h1>
                <button
                  onClick={handleStarClick}
                  className="text-4xl hover:scale-110 transition-transform"
                  aria-label={isStarred(cropId) ? 'Unstar crop' : 'Star crop'}
                >
                  {isStarred(cropId) ? '⭐' : '☆'}
                </button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <span className={`${getSeasonBadgeClass(crop.season_en)} px-4 py-2 rounded-full font-semibold`}>
                  {seasonName}
                </span>
                <p className="text-krishi-text/80 text-lg">
                  {lang === 'hi'
                    ? `${cropName} की विस्तृत खेती जानकारी`
                    : `Detailed Farming Information for ${cropName}`}
                </p>
              </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Link
                href={`/mandi?crop=${encodeURIComponent(crop.id)}`}
                className="bg-krishi-agriculture hover:bg-krishi-agriculture/90 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 text-center whitespace-nowrap"
              >
                {lang === 'hi' ? 'कृषि बाजार देखें' : 'View Krishi Bazaar →'}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Information Sections Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white border-2 border-krishi-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Section Header */}
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3">{section.icon}</span>
                <h2 className="text-2xl font-bold text-krishi-heading">
                  {section.title}
                </h2>
              </div>

              {/* Section Divider */}
              <div className="w-12 h-1 bg-krishi-primary rounded mb-4"></div>

              {/* Section Content */}
              <p className="text-krishi-text leading-relaxed text-base md:text-lg">
                {section.content}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-gradient-to-r from-krishi-primary/90 to-krishi-agriculture/90 rounded-lg p-8 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            {lang === 'hi'
              ? 'अधिक सहायता की आवश्यकता है?'
              : 'Need More Help?'}
          </h3>
          <p className="text-white/90 mb-6 text-lg">
            {lang === 'hi'
              ? 'कृषि सहायक से अपने खेती के सवाल पूछें'
              : 'Ask Krishi Sahayak your farming questions'}
          </p>
          <Link
            href="/ai-advisor"
            className="inline-block bg-white text-krishi-primary font-bold px-8 py-3 rounded-lg hover:bg-white/90 transition-colors"
          >
            {lang === 'hi' ? 'कृषि सहायक से पूछें' : 'Ask Krishi Sahayak'}
          </Link>
        </motion.div>
      </main>

      <Footer />
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </FeaturePageLayout>
  )
}
