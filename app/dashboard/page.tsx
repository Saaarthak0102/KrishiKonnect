'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'

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
      welcome: 'स्वागत है',
      dashboardTitle: 'किसान डैशबोर्ड',
      cropLibrary: 'फसल पुस्तकालय',
      cropLibraryDesc: 'सभी फसलों की जानकारी जानें',
      mandiPrices: 'मंडी भाव',
      mandiDesc: 'लाइव मार्केट दरें देखें',
      community: 'समुदाय',
      communityDesc: 'अन्य किसानों से जुड़ें',
      transport: 'परिवहन',
      transportDesc: 'अपनी फसल खिंचवाएं',
      aiAdvisor: 'AI सलाहकार',
      aiAdvisorDesc: 'कृषि विशेषज्ञ की सलाह पाएं',
      logout: 'लॉगआउट',
      yourProfile: 'आपकी प्रोफाइल',
      village: 'गांव',
      state: 'राज्य',
      primaryCrop: 'प्राथमिक फसल',
    },
    en: {
      welcome: 'Welcome back',
      dashboardTitle: 'Farmer Dashboard',
      cropLibrary: 'Crop Library',
      cropLibraryDesc: 'Learn about all crops',
      mandiPrices: 'Mandi Prices',
      mandiDesc: 'Check live market rates',
      community: 'Community',
      communityDesc: 'Connect with other farmers',
      transport: 'Transport',
      transportDesc: 'Arrange crop transport',
      aiAdvisor: 'AI Advisor',
      aiAdvisorDesc: 'Get expert farming advice',
      logout: 'Logout',
      yourProfile: 'Your Profile',
      village: 'Village',
      state: 'State',
      primaryCrop: 'Primary Crop',
    },
  }

  const t = translations[lang]

  const modules = [
    {
      title: t.cropLibrary,
      desc: t.cropLibraryDesc,
      icon: '🌾',
      href: '/crop-library',
      color: 'from-green-50 to-green-100',
    },
    {
      title: t.mandiPrices,
      desc: t.mandiDesc,
      icon: '💰',
      href: '/mandi',
      color: 'from-yellow-50 to-yellow-100',
    },
    {
      title: t.community,
      desc: t.communityDesc,
      icon: '🤝',
      href: '/community',
      color: 'from-blue-50 to-blue-100',
    },
    {
      title: t.transport,
      desc: t.transportDesc,
      icon: '🚚',
      href: '/transport',
      color: 'from-orange-50 to-orange-100',
    },
    {
      title: t.aiAdvisor,
      desc: t.aiAdvisorDesc,
      icon: '🤖',
      href: '/ai-advisor',
      color: 'from-purple-50 to-purple-100',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Profile Widget */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6 border-2 border-krishi-border"
      >
        <h2 className="text-xl font-bold text-krishi-heading mb-4">{t.yourProfile}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-krishi-text/60 font-semibold">{lang === 'hi' ? 'नाम' : 'Name'}</p>
            <p className="text-lg font-bold text-krishi-heading">{farmerProfile.name}</p>
          </div>
          <div>
            <p className="text-sm text-krishi-text/60 font-semibold">{t.village}</p>
            <p className="text-lg font-bold text-krishi-heading">{farmerProfile.village}</p>
          </div>
          <div>
            <p className="text-sm text-krishi-text/60 font-semibold">{t.state}</p>
            <p className="text-lg font-bold text-krishi-heading">{farmerProfile.state}</p>
          </div>
          <div>
            <p className="text-sm text-krishi-text/60 font-semibold">{t.primaryCrop}</p>
            <p className="text-lg font-bold text-krishi-heading">{farmerProfile.primaryCrop}</p>
          </div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <div>
          <h2 className="text-2xl font-bold text-krishi-heading mb-6">
            {lang === 'hi' ? 'उपलब्ध सेवाएं' : 'Available Services'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, idx) => (
              <motion.div
                key={module.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={module.href}>
                  <div className={`bg-gradient-to-br ${module.color} rounded-2xl shadow-md hover:shadow-lg transition-all p-6 cursor-pointer border-2 border-krishi-border hover:border-krishi-primary`}>
                    <div className="text-4xl mb-4">{module.icon}</div>
                    <h3 className="text-xl font-bold text-krishi-heading mb-2">
                      {module.title}
                    </h3>
                    <p className="text-krishi-text/70">{module.desc}</p>
                    <div className="mt-4 text-krishi-primary font-semibold">
                      {lang === 'hi' ? 'अनुभव करें →' : 'Explore →'}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }
