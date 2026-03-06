'use client'

import FeatureCard from './FeatureCard'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

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
    <section id="features" className="container mx-auto px-4 py-16">
      <h2 className="text-4xl md:text-5xl font-bold text-krishi-heading text-center mb-12">
        {t.featuresHeading}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={t[feature.titleKey as keyof typeof t] as string}
            description={t[feature.descKey as keyof typeof t] as string}
          />
        ))}
      </div>
    </section>
  )
}
