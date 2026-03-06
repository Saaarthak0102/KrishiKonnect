'use client'

import { motion } from 'framer-motion'

interface DataSourcesProps {
  lang?: string
}

export default function DataSources({ lang = 'en' }: DataSourcesProps) {
  const sources = [
    {
      icon: '🌤️',
      label: lang === 'hi' ? 'मौसम API' : 'Weather API',
    },
    {
      icon: '💰',
      label: lang === 'hi' ? 'कृषि बाजार' : 'Krishi Bazaar',
    },
    {
      icon: '🌾',
      label: lang === 'hi' ? 'कृषि फसल' : 'Krishi Fasal',
    },
    {
      icon: '📅',
      label: lang === 'hi' ? 'मौसमी कैलेंडर' : 'Seasonal Calendar',
    },
  ]

  const headerText = lang === 'hi' ? 'इस सलाह के लिए उपयोग किए गए डेटा:' : 'Data used for this advice:'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-krishi-border/30 pt-3 mt-3"
    >
      <p className="text-xs text-krishi-text/60 mb-2">{headerText}</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + idx * 0.1 }}
            className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-900"
          >
            <span className="text-green-600">✓</span>
            <span>{source.icon}</span>
            <span>{source.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
