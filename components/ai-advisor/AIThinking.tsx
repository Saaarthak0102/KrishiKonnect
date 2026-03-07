'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MdLocationOn, MdStorefront } from 'react-icons/md'
import { WiDaySunny } from 'react-icons/wi'
import { GiWheat, GiPlantSeed } from 'react-icons/gi'

interface AIThinkingProps {
  lang?: string
}

const CHECKING_STEPS_EN = [
  'Analyzing your location...',
  'Checking current weather...',
  'Reviewing crop stage...',
  'Fetching market prices...',
]

const CHECKING_STEPS_HI = [
  'आपके स्थान का विश्लेषण...',
  'मौसम की जांच...',
  'फसल की अवस्था की समीक्षा...',
  'बाज़ार मूल्य लाना...',
]

const getStepIcon = (idx: number) => {
  const icons = [
    <MdLocationOn size={16} key="location" />,
    <WiDaySunny size={16} key="weather" />,
    <GiPlantSeed size={16} key="crop" />,
    <MdStorefront size={16} key="market" />,
  ]
  return icons[idx] || null
}

export default function AIThinking({ lang = 'en' }: AIThinkingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = lang === 'hi' ? CHECKING_STEPS_HI : CHECKING_STEPS_EN

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [currentStep, steps.length])

  const headerText =
    lang === 'hi'
      ? (<><GiWheat size={20} className="inline" /> <span className="text-krishi-indigo">कृषि</span>{' '}<span className="text-krishi-clay">सहायक</span> आपकी खेती की स्थिति का विश्लेषण कर रहा है...</>)
      : (<><GiWheat size={20} className="inline" /> <span className="text-krishi-indigo">Krishi</span>{' '}<span className="text-krishi-clay">Sahayak</span> is analyzing your farm conditions...</>)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="ai-thinking-message flex justify-start"
    >
      <div 
        className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-xl rounded-bl-none border will-change-transform"
        style={{
          background: 'rgba(196,106,61,0.08)',
          borderColor: 'rgba(196,106,61,0.25)',
          animation: 'aiPulseGlow 2.8s infinite ease-in-out',
          transform: 'translateZ(0)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <GiWheat size={20} className="text-krishi-agriculture" />
          </motion.div>
          <p className="font-semibold text-sm">{headerText}</p>
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: idx <= currentStep ? 1 : 0.3,
                x: 0,
              }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-center gap-2"
            >
              {idx <= currentStep ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-600"
                >
                  ✓
                </motion.span>
              ) : (
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-krishi-clay/30 rounded-full"
                />
              )}
              <span className="flex-shrink-0">{getStepIcon(idx)}</span>
              <span className={`text-sm ${idx <= currentStep ? 'text-krishi-indigo' : 'text-krishi-indigo/40'}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-3 flex gap-1"
        >
          <span className="w-2 h-2 bg-krishi-clay rounded-full" />
          <span className="w-2 h-2 bg-krishi-clay rounded-full" />
          <span className="w-2 h-2 bg-krishi-clay rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  )
}
