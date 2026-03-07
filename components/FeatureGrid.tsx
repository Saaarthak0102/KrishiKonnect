'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { RiRobot2Line } from 'react-icons/ri'
import { GiPlantSeed } from 'react-icons/gi'
import { MdStorefront } from 'react-icons/md'
import { FaUsers, FaTruck } from 'react-icons/fa'
import { HiOutlineChartBar } from 'react-icons/hi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Helper function to render two-colored Krishi titles
function renderKrishiTitle(title: string) {
  if (title.startsWith('Krishi ')) {
    const parts = title.split(' ')
    return (
      <>
        <span className="text-krishi-indigo">Krishi</span>
        {' '}
        <span className="text-krishi-clay">{parts.slice(1).join(' ')}</span>
      </>
    )
  }
  return <span className="text-krishi-indigo">{title}</span>
}

export default function FeatureGrid() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const router = useRouter()
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

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

  useEffect(() => {
    featureRefs.current.forEach((ref) => {
      if (ref) {
        gsap.fromTo(
          ref,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ref,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        )
      }
    })
  }, [])

  return (
    <section id="features" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-krishi-indigo text-center mb-20">
          {t.featuresHeading}
        </h2>
        
        <div className="space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0
            const title = t[feature.titleKey as keyof typeof t] as string
            const description = t[feature.descKey as keyof typeof t] as string
            
            return (
              <div
                key={index}
                ref={(el) => {
                  featureRefs.current[index] = el
                }}
                className="grid grid-cols-12 gap-12 items-center"
              >
                {/* Illustration Placeholder */}
                <div className={`col-span-12 md:col-span-7 ${!isEven ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="w-full h-[320px] bg-white/45 backdrop-blur-sm rounded-xl flex items-center justify-center border border-neutral-200">
                    <span className="text-neutral-400 text-sm font-medium">Illustration Placeholder</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className={`col-span-12 md:col-span-5 flex flex-col ${!isEven ? 'md:order-1' : 'md:order-2'}`}>
                  {/* Feature Icon */}
                  <div className="mb-6">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 bg-white/75 backdrop-blur-sm rounded-xl border-2 border-krishi-border shadow-sm text-krishi-clay"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.icon}
                    </motion.div>
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">
                    {renderKrishiTitle(title)}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-krishi-indigo/80 text-lg leading-relaxed mb-6 max-w-lg">
                    {description}
                  </p>

                  {/* Optional CTA */}
                  {feature.cta && (
                    <div>
                      <motion.button
                        onClick={() => router.push(feature.cta.href)}
                        className="inline-flex items-center px-6 py-3 bg-krishi-clay text-white font-semibold rounded-lg hover:bg-krishi-clay/90 transition-colors duration-200 shadow-md hover:shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {feature.cta.label}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
