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
        className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(196,106,61,0.45),rgba(255,255,255,0.35))] backdrop-blur-[14px] rounded-[20px] p-8 md:p-12 text-center border-2 border-[#C46A3D] shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_rgba(0,0,0,0.15)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.25),transparent_40%)]" />
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2D2A6E]">
          {t.ctaHeading}
        </h2>
        <p className="text-lg md:text-xl mb-8 text-[rgba(45,42,110,0.85)]">
          {renderTextWithBrand(t.ctaSubtext)}
        </p>
        <motion.div
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/login"
            className="inline-block px-8 py-4 rounded-lg font-semibold text-lg shadow-[0_6px_14px_rgba(0,0,0,0.08)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(0,0,0,0.12)]"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#C46A3D',
              transition: 'all 0.25s ease',
            }}
          >
            {t.getStarted}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
