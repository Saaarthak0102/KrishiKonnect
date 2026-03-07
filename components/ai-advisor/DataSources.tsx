'use client'

import { motion } from 'framer-motion'
import { WiDaySunny } from 'react-icons/wi'
import { FiTrendingUp, FiCalendar } from 'react-icons/fi'
import { GiPlantSeed } from 'react-icons/gi'

interface DataSourcesProps {
  lang?: string
}

export default function DataSources({ lang = 'en' }: DataSourcesProps) {
  const sources = [
    {
      icon: <WiDaySunny size={18} />,
      label: lang === 'hi' ? 'मौसम API' : 'Weather API',
      isKrishi: false,
    },
    {
      icon: <FiTrendingUp size={16} />,
      labelPart1: lang === 'hi' ? 'कृषि' : 'Krishi',
      labelPart2: lang === 'hi' ? 'बाजार' : 'Bazaar',
      isKrishi: true,
    },
    {
      icon: <GiPlantSeed size={16} />,
      labelPart1: lang === 'hi' ? 'कृषि' : 'Krishi',
      labelPart2: lang === 'hi' ? 'फसल' : 'Fasal',
      isKrishi: true,
    },
    {
      icon: <FiCalendar size={16} />,
      label: lang === 'hi' ? 'मौसमी कैलेंडर' : 'Seasonal Calendar',
      isKrishi: false,
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
      <p className="text-xs mb-2" style={{ color: 'rgba(45,42,110,0.6)' }}>{headerText}</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + idx * 0.1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
            style={{
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(196,106,61,0.25)',
              color: '#2D2A6E',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: '#2D2A6E', opacity: 0.9 }}>{source.icon}</span>
            {source.isKrishi ? (
              <span>
                <span style={{ color: '#2D2A6E' }}>{source.labelPart1}</span>
                {' '}
                <span style={{ color: '#C46A3D' }}>{source.labelPart2}</span>
              </span>
            ) : (
              <span>{source.label}</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
