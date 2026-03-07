'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import BrandName from '@/components/ui/BrandName'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function renderTextWithBrand(text: string) {
  const parts = text.split('KrishiKonnect')
  if (parts.length === 1) {
    return text
  }

  return parts.map((part, index) => (
    <span key={`brand-part-${index}`}>
      {part}
      {index < parts.length - 1 ? <BrandName /> : null}
    </span>
  ))
}

export default function CTASection() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
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
            trigger: ctaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    }
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div
        ref={ctaRef}
        className="bg-krishi-clay/90 backdrop-blur-md text-white rounded-2xl p-8 md:p-12 text-center shadow-xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          {t.ctaHeading}
        </h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          {renderTextWithBrand(t.ctaSubtext)}
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/login"
            className="inline-block bg-white/85 backdrop-blur-sm text-krishi-clay px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {t.getStarted}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
