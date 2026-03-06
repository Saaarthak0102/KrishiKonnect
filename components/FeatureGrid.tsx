'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

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

  const features = [
    {
      icon: '🤖',
      titleKey: 'aiAdvisor',
      descKey: 'aiAdvisorDesc',
    },
    {
      icon: '📚',
      titleKey: 'cropLibrary',
      descKey: 'cropLibraryDesc',
    },
    {
      icon: '💰',
      titleKey: 'mandiPrices',
      descKey: 'mandiPricesDesc',
    },
    {
      icon: '🤝',
      titleKey: 'community',
      descKey: 'communityDesc',
    },
    {
      icon: '🚚',
      titleKey: 'transport',
      descKey: 'transportDesc',
    },
    {
      icon: '📊',
      titleKey: 'dataAnalytics',
      descKey: 'dataAnalyticsDesc',
    }
  ]

  return (
    <section id="features" className="bg-krishi-bg py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-krishi-heading text-center mb-16">
          {t.featuresHeading}
        </h2>
        
        <div className="space-y-20">
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
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12`}
              >
                {/* Icon Section */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white border-2 border-krishi-border rounded-2xl shadow-md flex items-center justify-center text-6xl md:text-7xl">
                    {feature.icon}
                  </div>
                </motion.div>

                {/* Content Section */}
                <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-center`}>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {renderKrishiTitle(title)}
                  </h3>
                  <p className="text-krishi-text text-lg md:text-xl leading-relaxed max-w-2xl mx-auto md:mx-0">
                    {description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
