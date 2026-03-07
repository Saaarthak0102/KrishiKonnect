'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Toast from '@/components/Toast'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { useStarredCrops } from '@/lib/useStarredCrops'
import Link from 'next/link'
import cropsData from '@/data/crops.json'
import { 
  GiPlantSeed, 
  GiGroundSprout, 
  GiWheat 
} from 'react-icons/gi'
import { 
  WiDaySunny 
} from 'react-icons/wi'
import { 
  MdCalendarToday, 
  MdWaterDrop 
} from 'react-icons/md'
import { 
  FiTrendingUp 
} from 'react-icons/fi'
import { 
  HiStar, 
  HiOutlineStar 
} from 'react-icons/hi'
import { 
  BsBugFill 
} from 'react-icons/bs'
import { 
  FaFlask 
} from 'react-icons/fa'

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
      <DashboardLayout>
        <div className="relative min-h-screen">
          <main className="container mx-auto px-4 py-16">
            <div className="text-center py-12">
              <h1 className="text-3xl font-semibold text-[#2D2A6E] mb-4">
                {lang === 'hi' ? 'फसल नहीं मिली' : 'Crop Not Found'}
              </h1>
              <p className="text-[rgba(45,42,110,0.75)] mb-6">
                {lang === 'hi'
                  ? 'यह फसल उपलब्ध नहीं है।'
                  : 'This crop is not available.'}
              </p>
              <Link
                href="/crop-library"
                className="inline-block bg-[#2D2A6E] hover:bg-[#3a378a] text-white px-6 py-2 rounded-[10px] hover:scale-[1.02] transition-all duration-250 ease-out font-medium hover:shadow-[0_6px_16px_rgba(45,42,110,0.25)]"
              >
                {lang === 'hi' ? 'वापस जाएं' : 'Go Back'}
              </Link>
            </div>
          </main>
        </div>
      </DashboardLayout>
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
      icon: GiPlantSeed,
    },
    {
      title: lang === 'hi' ? 'मिट्टी' : 'Soil',
      content: soilInfo,
      icon: GiGroundSprout,
    },
    {
      title: lang === 'hi' ? 'जलवायु' : 'Climate',
      content: climateInfo,
      icon: WiDaySunny,
    },
    {
      title: lang === 'hi' ? 'बुवाई का समय' : 'Sowing Time',
      content: sowingInfo,
      icon: MdCalendarToday,
    },
    {
      title: lang === 'hi' ? 'सिंचाई' : 'Irrigation',
      content: irrigationInfo,
      icon: MdWaterDrop,
    },
    {
      title: lang === 'hi' ? 'उर्वरक' : 'Fertilizer',
      content: fertilizerInfo,
      icon: FaFlask,
    },
    {
      title: lang === 'hi' ? 'कीट / रोग' : 'Pests & Diseases',
      content: pestsInfo,
      icon: BsBugFill,
    },
    {
      title: lang === 'hi' ? 'अपेक्षित उपज' : 'Expected Yield',
      content: yieldInfo,
      icon: FiTrendingUp,
    },
  ]

  return (
    <DashboardLayout>
      <div className="relative min-h-screen">
        <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/crop-library"
          className="inline-flex items-center text-[#2D2A6E] hover:text-[#C46A3D] transition-all duration-250 mb-8 font-semibold transform hover:translate-x-[-2px]"
        >
          <span className="mr-2">←</span>
          {lang === 'hi' ? 'वापस जाएं' : 'Back to Library'}
        </Link>

        {/* Crop Header Section - Glassmorphism Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_14px_rgba(45,42,110,0.10)] mb-12 rounded-2xl bg-white/55 backdrop-blur-[12px] border border-[rgba(196,106,61,0.25)]"
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D2A6E]/80 to-[#C46A3D]/80 flex items-center justify-center text-8xl font-bold opacity-0 hover:opacity-100 transition-opacity duration-300">
              {cropName.charAt(0)}
            </div>
          </div>

          {/* Crop Info */}
          <div className="p-8 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            {/* Left Side - Crop Details */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-[1.6rem] md:text-5xl font-semibold text-[#2D2A6E]">
                  {cropName}
                </h1>
                <button
                  onClick={handleStarClick}
                  className="text-[22px] hover:scale-110 transition-transform duration-250"
                  aria-label={isStarred(cropId) ? 'Unstar crop' : 'Star crop'}
                >
                  {isStarred(cropId) ? (
                    <HiStar className="text-[#C46A3D]" size={22} />
                  ) : (
                    <HiOutlineStar className="text-[#2D2A6E] opacity-85" size={22} />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <span className={`${getSeasonBadgeClass(crop.season_en)} px-4 py-2 rounded-full font-semibold`}>
                  {seasonName}
                </span>
                <p className="text-[rgba(45,42,110,0.75)] text-[0.95rem]">
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
                className="bg-[#2D2A6E] hover:bg-[#3a378a] text-white font-medium px-[18px] py-[10px] rounded-[10px] transition-all duration-250 ease-out text-center whitespace-nowrap hover:scale-[1.02] hover:shadow-[0_6px_16px_rgba(45,42,110,0.25)]"
              >
                {lang === 'hi' ? (
                  <>
                    <span className="text-white">कृषि</span>
                    {' '}
                    <span className="text-white">बाजार देखें</span>
                  </>
                ) : (
                  <>
                    {'View Krishi Bazaar'}
                  </>
                )}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Information Sections Grid - Glass Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12"
        >
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-white/55 backdrop-blur-[12px] border border-[rgba(196,106,61,0.25)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:transform hover:translate-y-[-3px] transition-all duration-250 ease-out"
              >
                {/* Section Header */}
                <div className="flex items-center mb-4">
                  <IconComponent 
                    className="text-[#2D2A6E] opacity-85 mr-3 transform hover:translate-y-[-1px] transition-transform duration-250" 
                    size={22} 
                  />
                  <h2 className="text-[1.25rem] font-semibold text-[#2D2A6E]">
                    {section.title}
                  </h2>
                </div>

                {/* Section Divider */}
                <div className="w-12 h-1 bg-[#C46A3D] rounded mb-4"></div>

                {/* Section Content - Inner Glass Effect */}
                <div className="bg-white/45 border border-[rgba(196,106,61,0.30)] rounded-[14px] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
                  <p className="text-[rgba(45,42,110,0.75)] leading-relaxed text-base">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-gradient-to-r from-[#2D2A6E]/90 to-[#C46A3D]/90 rounded-2xl p-8 text-white text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
        >
          <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-white">
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
            className="inline-block bg-white/85 backdrop-blur-sm font-medium px-8 py-3 rounded-[10px] hover:bg-white/95 transition-all duration-250 ease-out hover:scale-[1.02] hover:shadow-[0_6px_16px_rgba(255,255,255,0.25)]"
          >
            {lang === 'hi' ? (
              <>
                <span className="text-[#2D2A6E]">कृषि</span>
                {' '}
                <span className="text-[#C46A3D]">सहायक</span>
                {' से पूछें'}
              </>
            ) : (
              <>
                {'Ask '}
                <span className="text-[#2D2A6E]">Krishi</span>
                {' '}
                <span className="text-[#C46A3D]">Sahayak</span>
              </>
            )}
          </Link>
        </motion.div>
      </main>
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </DashboardLayout>
  )
}
