'use client'

import { motion } from 'framer-motion'
import { FiBarChart2, FiGlobe, FiTrendingUp } from 'react-icons/fi'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function HowItWorks() {
  const { lang } = useLanguage()
  const t = translations[lang]

  const steps = [
    { icon: FiGlobe, titleKey: 'step1Title', descKey: 'step1Desc' },
    { icon: FiBarChart2, titleKey: 'step2Title', descKey: 'step2Desc' },
    { icon: FiTrendingUp, titleKey: 'step3Title', descKey: 'step3Desc' }
  ]

  return (
    <section 
      id="how-it-works" 
      className="max-w-6xl mx-auto px-6 py-20 bg-white/65 backdrop-blur-[12px] border border-indigo-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[20px] my-16"
    >
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-krishi-indigo text-center mb-12">
        {t.howItWorksHeading}
      </h2>
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="hidden md:block absolute top-8 left-[16.666%] right-[16.666%] h-px bg-indigo-500/20" aria-hidden="true" />
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="group text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
          >
            <div className="w-16 h-16 mb-4 mx-auto flex items-center justify-center">
              <motion.div
                className="text-indigo-600"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <step.icon size={38} />
              </motion.div>
            </div>
            <h3 className="text-2xl font-semibold text-krishi-indigo mb-3">
              {t[step.titleKey as keyof typeof t]}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t[step.descKey as keyof typeof t]}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
