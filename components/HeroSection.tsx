'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { GiWheat } from 'react-icons/gi'
import BrandName from '@/components/ui/BrandName'

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

export default function HeroSection() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section id="home" className="max-w-6xl mx-auto px-6 py-24">
      <div className="grid grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="col-span-12 md:col-span-5"
        >
          <div className="flex flex-col items-start gap-4 mb-4">
            <Image
              src="/images/icon.png"
              alt="KrishiKonnect Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
            <h1 className="text-4xl md:text-5xl font-bold text-krishi-indigo">
              {t.heroHeadline}
            </h1>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-krishi-indigo mb-3 sr-only">
            {t.heroHeadline}
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-krishi-clay mb-6">
            {t.heroTagline}
          </p>
          <p className="text-lg md:text-xl text-krishi-indigo/80 mb-8">
            {renderTextWithBrand(t.heroSubtext)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-block bg-krishi-clay text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {t.startUsing}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                className="inline-block border-2 border-krishi-clay text-krishi-clay px-8 py-4 rounded-lg font-semibold text-lg hover:bg-krishi-clay hover:text-white transition-colors"
              >
                {t.exploreFeatures}
              </a>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="col-span-12 md:col-span-7"
        >
          <div className="bg-white/45 backdrop-blur-md border border-indigo-200/40 rounded-2xl p-8 md:p-12 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-8xl mb-4 flex justify-center">
              <GiWheat size={96} className="text-krishi-agriculture" />
            </div>
            <p className="text-2xl font-semibold text-krishi-indigo">
              {t.harvestSuccess}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
