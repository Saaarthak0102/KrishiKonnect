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
                className="inline-block bg-[#2D2A6E] hover:bg-[#3a378a] text-white px-6 py-2 rounded-[10px] hover:scale-[1.03] active:scale-[0.98] transition-all duration-[250ms] ease-out font-medium hover:shadow-[0_8px_20px_rgba(45,42,110,0.30),0_0_14px_rgba(45,42,110,0.18)]"
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
          className="inline-flex items-center text-[#2D2A6E] hover:text-[#C46A3D] transition-all duration-[250ms] mb-8 font-semibold transform hover:translate-x-[-2px] hover:scale-[1.02]"
        >
          <span className="mr-2">←</span>
          {lang === 'hi' ? 'वापस जाएं' : 'Back to Library'}
        </Link>

        {/* Crop Header Section - Glassmorphism Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.08),0_0_14px_rgba(45,42,110,0.10)] mb-12 rounded-[18px] bg-[rgba(255,255,255,0.55)] backdrop-blur-[14px] [-webkit-backdrop-filter:blur(14px)] border border-[rgba(196,106,61,0.25)] transition-[transform,box-shadow,border-color,background] duration-[250ms] ease-out hover:transform hover:translate-y-[-4px] hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(0,0,0,0.10),0_0_18px_rgba(196,106,61,0.15)] hover:border-[rgba(196,106,61,0.35)]"
          style={{ animation: 'cardReveal 0.5s ease forwards' }}
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
                <h1 className="text-[1.7rem] md:text-5xl font-semibold text-[#2D2A6E]" style={{ letterSpacing: '0.3px', textShadow: '0 0 8px rgba(45,42,110,0.10)' }}>
                  {cropName}
                </h1>
                <button
                  onClick={handleStarClick}
                  className="transition-[transform,filter] duration-[200ms] ease-out hover:scale-[1.15] hover:rotate-[-5deg] active:scale-95"
                  aria-label={isStarred(cropId) ? 'Unstar crop' : 'Star crop'}
                  style={{ 
                    marginLeft: '8px',
                    filter: 'drop-shadow(0 0 6px rgba(196,106,61,0.35))' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(196,106,61,0.45))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(196,106,61,0.35))'
                  }}
                >
                  {isStarred(cropId) ? (
                    <HiStar className="text-[#C46A3D]" size={26} />
                  ) : (
                    <HiOutlineStar className="text-[#C46A3D] opacity-75" size={26} />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <span 
                  className="px-[14px] py-[6px] rounded-[999px] font-semibold text-[0.85rem] border" 
                  style={{
                    background: 'rgba(46,157,87,0.12)',
                    color: '#2E9D57',
                    borderColor: 'rgba(46,157,87,0.25)',
                    boxShadow: '0 0 10px rgba(46,157,87,0.12)',
                    animation: 'badgeGlow 2.8s ease-in-out infinite'
                  }}
                >
                  {seasonName}
                </span>
                <p className="text-[#C46A3D] text-[0.95rem] font-medium" style={{ opacity: 0.9 }}>
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
                className="text-white font-medium px-[18px] py-[10px] rounded-[12px] transition-all duration-[250ms] ease-out text-center whitespace-nowrap hover:transform hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: 'rgba(45,42,110,0.90)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 6px 18px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.12)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3a378a'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(45,42,110,0.30), 0 0 14px rgba(45,42,110,0.18)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(45,42,110,0.90)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.12)'
                }}
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.05, duration: 0.5 }}
                className="group bg-white/55 backdrop-blur-[12px] border border-[rgba(196,106,61,0.25)] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:bg-[linear-gradient(120deg,rgba(255,255,255,0.35),rgba(255,255,255,0.55))] hover:transform hover:translate-y-[-4px] hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(0,0,0,0.10),0_0_18px_rgba(196,106,61,0.15)] hover:border-[rgba(196,106,61,0.35)] transition-[transform,box-shadow,border-color,background] duration-[250ms] ease-out"
                style={{ animationDelay: `${index * 0.05}s`, animation: 'cardReveal 0.5s ease forwards' }}
              >
                {/* Section Header */}
                <div className="flex items-center mb-4">
                  <IconComponent 
                    className="text-[#2D2A6E] opacity-85 mr-3 transform group-hover:translate-y-[-2px] group-hover:scale-[1.05] transition-transform duration-[200ms] ease-out" 
                    size={22} 
                  />
                  <h2 className="text-[1.25rem] font-semibold text-[#2D2A6E]">
                    {section.title}
                  </h2>
                </div>

                {/* Section Divider */}
                <div className="w-12 h-1 bg-[#C46A3D] rounded mb-4"></div>

                {/* Section Content - Inner Glass Effect */}
                <div className="bg-white/45 border border-[rgba(196,106,61,0.30)] rounded-[14px] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:bg-white/65 hover:transform hover:translate-x-[2px] transition-[all] duration-[200ms] ease-out">
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-[18px] p-8 text-center border border-[rgba(45,42,110,0.25)] shadow-[0_16px_36px_rgba(0,0,0,0.10),0_0_16px_rgba(45,42,110,0.15),0_0_8px_rgba(45,42,110,0.10)] hover:transform hover:translate-y-[-3px] hover:shadow-[0_20px_42px_rgba(0,0,0,0.12),0_0_20px_rgba(45,42,110,0.20),0_0_10px_rgba(45,42,110,0.14)] transition-all duration-[250ms] ease-out"
          style={{
            background: 'linear-gradient(135deg, rgba(45,42,110,0.35), rgba(45,42,110,0.20)), rgba(255,255,255,0.32)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            animation: 'cardReveal 0.5s ease forwards',
            animationDelay: '0.4s',
          }}
        >
          <h3 className="text-[1.45rem] md:text-[1.55rem] font-semibold mb-3 text-[#2D2A6E] [text-shadow:0_0_10px_rgba(45,42,110,0.12)]">
            {lang === 'hi'
              ? 'अधिक सहायता की आवश्यकता है?'
              : 'Need More Help?'}
          </h3>
          <p className="mb-6 text-[0.95rem] md:text-base text-[rgba(45,42,110,0.75)]">
            {lang === 'hi' ? (
              <>
                {'अपने खेती के सवाल '}
                <span className="text-[#C46A3D] font-semibold">कृषि सहायक</span>
                {' से पूछें'}
              </>
            ) : (
              <>
                {'Ask '}
                <span className="text-[#C46A3D] font-semibold">Krishi Sahayak</span>
                {' your farming questions'}
              </>
            )}
          </p>
          <Link
            href="/ai-advisor"
            className="inline-block bg-[rgba(45,42,110,0.90)] text-white border border-[rgba(255,255,255,0.18)] font-medium px-5 py-[10px] rounded-[12px] shadow-[0_8px_20px_rgba(45,42,110,0.30),0_0_12px_rgba(45,42,110,0.18)] backdrop-blur-[6px] hover:transform hover:translate-y-[-2px] hover:scale-[1.03] hover:bg-[#3a378a] hover:shadow-[0_12px_28px_rgba(45,42,110,0.35),0_0_16px_rgba(45,42,110,0.20)] transition-all duration-[250ms] ease-out active:scale-[0.98]"
          >
            {lang === 'hi' ? (
              <>
                <span className="text-white">कृषि</span>
                {' '}
                <span className="text-[#C46A3D]">सहायक</span>
                {' से पूछें'}
              </>
            ) : (
              <>
                {'Ask '}
                <span className="text-white">Krishi</span>
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
