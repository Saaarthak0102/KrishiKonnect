'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { RiRobot2Line } from 'react-icons/ri'
import { GiPlantSeed } from 'react-icons/gi'
import { MdStorefront } from 'react-icons/md'
import { FaUsers, FaTruck } from 'react-icons/fa'
import { HiOutlineChartBar } from 'react-icons/hi'

// Helper function to render two-colored Krishi titles
function renderKrishiTitle(title: string) {
  if (title.startsWith('Krishi ')) {
    const parts = title.split(' ')
    return (
      <>
        <span className="text-[#2D4B8C]">Krishi</span>
        {' '}
        <span className="text-[#C96A3A]">{parts.slice(1).join(' ')}</span>
      </>
    )
  }
  return <span className="text-krishi-heading">{title}</span>
}

export default function FeatureGrid() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const router = useRouter()

  const features = [
    {
      icon: <RiRobot2Line size={40} />,
      titleKey: 'aiAdvisor',
      descKey: 'aiAdvisorDesc',
      cta: {
        label: 'Ask Krishi Sahayak',
        href: '/ai-advisor'
      }
    },
    {
      icon: <GiPlantSeed size={40} />,
      titleKey: 'cropLibrary',
      descKey: 'cropLibraryDesc',
      cta: {
        label: 'Browse Crops',
        href: '/crop-library'
      }
    },
    {
      icon: <MdStorefront size={40} />,
      titleKey: 'mandiPrices',
      descKey: 'mandiPricesDesc',
      cta: {
        label: 'View Prices',
        href: '/mandi'
      }
    },
    {
      icon: <FaUsers size={40} />,
      titleKey: 'community',
      descKey: 'communityDesc',
      cta: {
        label: 'Join Community',
        href: '/community'
      }
    },
    {
      icon: <FaTruck size={40} />,
      titleKey: 'transport',
      descKey: 'transportDesc',
    },
    {
      icon: <HiOutlineChartBar size={40} />,
      titleKey: 'dataAnalytics',
      descKey: 'dataAnalyticsDesc',
    }
  ]

  return (
    <section id="features" className="bg-krishi-bg py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-krishi-heading text-center mb-20">
          {t.featuresHeading}
        </h2>
        
        <div className="space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0
            const title = t[feature.titleKey as keyof typeof t] as string
            const description = t[feature.descKey as keyof typeof t] as string
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`grid md:grid-cols-2 gap-12 lg:gap-16 items-center ${!isEven ? 'md:grid-flow-dense' : ''}`}
              >
                {/* Illustration Placeholder */}
                <div className={`${!isEven ? 'md:col-start-2' : ''}`}>
                  <div className="w-full h-[320px] bg-neutral-100 rounded-xl flex items-center justify-center border border-neutral-200">
                    <span className="text-neutral-400 text-sm font-medium">Illustration Placeholder</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className={`${!isEven ? 'md:col-start-1 md:row-start-1' : ''} flex flex-col`}>
                  {/* Feature Icon */}
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl border-2 border-krishi-border shadow-sm text-krishi-primary">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    {renderKrishiTitle(title)}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-krishi-text text-lg leading-relaxed mb-6 max-w-lg">
                    {description}
                  </p>

                  {/* Optional CTA */}
                  {feature.cta && (
                    <div>
                      <button
                        onClick={() => router.push(feature.cta.href)}
                        className="inline-flex items-center px-6 py-3 bg-krishi-primary text-white font-semibold rounded-lg hover:bg-krishi-primary-dark transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        {feature.cta.label}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
