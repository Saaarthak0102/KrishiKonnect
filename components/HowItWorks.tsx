'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function HowItWorks() {
  const { lang } = useLanguage()
  const t = translations[lang]

  const steps = [
    { number: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
    { number: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
    { number: '3', titleKey: 'step3Title', descKey: 'step3Desc' }
  ]

  return (
    <section className="container mx-auto px-4 py-16 bg-white/50 rounded-2xl my-16">
      <h2 className="text-4xl md:text-5xl font-bold text-krishi-heading text-center mb-12">
        {t.howItWorksHeading}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="text-center"
          >
            <div className="inline-block bg-krishi-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              {step.number}
            </div>
            <h3 className="text-2xl font-semibold text-krishi-heading mb-3">
              {t[step.titleKey as keyof typeof t]}
            </h3>
            <p className="text-krishi-text/80">
              {t[step.descKey as keyof typeof t]}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
