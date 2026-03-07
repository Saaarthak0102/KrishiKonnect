'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HowItWorks() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const sectionRef = useRef<HTMLElement>(null)

  const steps = [
    { number: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
    { number: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
    { number: '3', titleKey: 'step3Title', descKey: 'step3Desc' }
  ]

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
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
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="how-it-works" 
      className="max-w-6xl mx-auto px-6 py-20 bg-white/50 rounded-2xl my-16"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-krishi-indigo text-center mb-12">
        {t.howItWorksHeading}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="text-center"
          >
            <motion.div
              className="inline-block bg-krishi-clay text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {step.number}
            </motion.div>
            <h3 className="text-2xl font-semibold text-krishi-indigo mb-3">
              {t[step.titleKey as keyof typeof t]}
            </h3>
            <p className="text-krishi-indigo/80">
              {t[step.descKey as keyof typeof t]}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
