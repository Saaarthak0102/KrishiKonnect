'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { RiRobot2Line } from 'react-icons/ri'
import { FiArrowRight, FiCheckCircle, FiZap } from 'react-icons/fi'

export default function AIHighlight() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <section id="ai-advisor" className="max-w-6xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-krishi-agriculture/20 to-krishi-highlight/20 border-2 border-krishi-agriculture rounded-2xl p-8 md:p-12"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {lang === 'hi' ? (
              <>
                <span className="text-krishi-indigo">कृषि</span>
                {' '}
                <span className="text-krishi-clay">सहायक</span>
                {' - आपका डिजिटल कृषि विशेषज्ञ '}
                <RiRobot2Line className="inline" size={40} />
              </>
            ) : (
              <>
                <span className="text-krishi-indigo">Krishi</span>
                {' '}
                <span className="text-krishi-clay">Sahayak</span>
                {' - Your Digital Agriculture Expert '}
                <RiRobot2Line className="inline" size={40} />
              </>
            )}
          </h2>
          <p className="text-lg text-krishi-indigo/80">
            {t.aiHighlightSubtext}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-white/50 backdrop-blur-md border border-indigo-200/40 rounded-2xl p-6 mb-6 shadow-lg"
        >
          <p className="text-sm text-gray-500 mb-3">{t.aiExampleTitle}</p>

          <div className="space-y-3 text-sm md:text-[0.95rem]">
            <div className="flex justify-end">
              <div className="max-w-[70%]">
                <div className="bg-[#C46A3D] text-white rounded-xl px-3 py-2 text-left leading-relaxed shadow-sm">
                  kya ghaziabad mai kela ugaya ja sakta hai
                </div>
                <p className="text-xs text-right text-gray-600/60 mt-1">01:28 AM</p>
              </div>
            </div>

            <div className="bg-emerald-100/60 border-l-4 border-emerald-500 rounded-xl p-4 text-left">
              <p className="flex items-center gap-2 text-emerald-800 font-semibold mb-2">
                <FiZap className="h-4 w-4" />
                Quick Answer
              </p>
              <p className="text-krishi-indigo leading-relaxed">
                Haan, Ghaziabad mein kela ugaya ja sakta hai, lekin kuch khaas baaton ka dhyaan rakhna padega.
              </p>
            </div>

            <div className="bg-indigo-100/60 border-l-4 border-indigo-500 rounded-xl p-4 text-left">
              <p className="flex items-center gap-2 text-indigo-800 font-semibold mb-2">
                <FiCheckCircle className="h-4 w-4" />
                Recommended Action
              </p>
              <ul className="space-y-1 text-krishi-indigo">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                  <span>Mitti ki jaanch karwayen</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                  <span>Sahi variety choose karein (G-9)</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="h-4 w-4 mt-0.5 text-indigo-600" />
                  <span>Paani ka sahi management rakhein</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="text-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/ai-advisor"
              className="inline-flex items-center gap-2 bg-krishi-clay text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              {t.aiTryButton}
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
