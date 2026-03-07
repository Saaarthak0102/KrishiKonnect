'use client'

import { motion } from 'framer-motion'
import { HiOutlineLightBulb } from 'react-icons/hi'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { WiDaySunny } from 'react-icons/wi'
import { MdStorefront } from 'react-icons/md'

interface AnswerCardProps {
  content: string
  lang?: string
}

interface ParsedResponse {
  quickAnswer?: string
  recommendedAction?: string
  weatherImpact?: string
  marketInsight?: string
  fullText?: string
}

function parseAIResponse(content: string): ParsedResponse {
  const parsed: ParsedResponse = {}

  // Try to extract structured sections
  const quickAnswerMatch = content.match(/1\)?\s*Quick Answer[:\s]*([\s\S]*?)(?=2\)|$)/i)
  const recommendedActionMatch = content.match(
    /2\)?\s*Recommended Action[:\s]*([\s\S]*?)(?=3\)|$)/i
  )
  const weatherImpactMatch = content.match(/3\)?\s*Weather Impact[:\s]*([\s\S]*?)(?=4\)|$)/i)
  const marketInsightMatch = content.match(/4\)?\s*Market Insight[:\s]*([\s\S]*?)$/i)

  if (quickAnswerMatch) parsed.quickAnswer = quickAnswerMatch[1].trim()
  if (recommendedActionMatch) parsed.recommendedAction = recommendedActionMatch[1].trim()
  if (weatherImpactMatch) parsed.weatherImpact = weatherImpactMatch[1].trim()
  if (marketInsightMatch) parsed.marketInsight = marketInsightMatch[1].trim()

  // If no structure found, use full text
  if (!quickAnswerMatch && !recommendedActionMatch) {
    parsed.fullText = content
  }

  return parsed
}

export default function AnswerCard({ content, lang = 'en' }: AnswerCardProps) {
  const parsed = parseAIResponse(content)

  // If no structured content, show as plain text
  if (parsed.fullText) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-sm border border-krishi-agriculture/20 rounded-lg p-4 shadow-sm space-y-3"
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-krishi-indigo">
          {parsed.fullText}
        </p>
      </motion.div>
    )
  }

  // Structured response
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Quick Answer */}
      {parsed.quickAnswer && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50/80 to-white/70 backdrop-blur-sm border border-green-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineLightBulb size={20} className="text-green-600" />
            <h4 className="font-semibold text-green-900">
              {lang === 'hi' ? 'त्वरित उत्तर' : 'Quick Answer'}
            </h4>
          </div>
          <p className="text-sm text-krishi-indigo whitespace-pre-wrap break-words leading-relaxed">
            {parsed.quickAnswer}
          </p>
        </motion.div>
      )}

      {/* Recommended Action */}
      {parsed.recommendedAction && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50/80 to-white/70 backdrop-blur-sm border border-blue-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <AiOutlineCheckCircle size={20} className="text-blue-600" />
            <h4 className="font-semibold text-blue-900">
              {lang === 'hi' ? 'अनुशंसित कार्रवाई' : 'Recommended Action'}
            </h4>
          </div>
          <p className="text-sm text-krishi-indigo whitespace-pre-wrap break-words leading-relaxed">
            {parsed.recommendedAction}
          </p>
        </motion.div>
      )}

      {/* Weather Impact */}
      {parsed.weatherImpact && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-amber-50/80 to-white/70 backdrop-blur-sm border border-amber-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <WiDaySunny size={24} className="text-amber-600" />
            <h4 className="font-semibold text-amber-900">
              {lang === 'hi' ? 'मौसम का प्रभाव' : 'Weather Impact'}
            </h4>
          </div>
          <p className="text-sm text-krishi-indigo whitespace-pre-wrap break-words leading-relaxed">
            {parsed.weatherImpact}
          </p>
        </motion.div>
      )}

      {/* Market Insight */}
      {parsed.marketInsight && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-50/80 to-white/70 backdrop-blur-sm border border-purple-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <MdStorefront size={20} className="text-purple-600" />
            <h4 className="font-semibold text-purple-900">
              {lang === 'hi' ? 'बाजार अंतर्दृष्टि' : 'Market Insight'}
            </h4>
          </div>
          <p className="text-sm text-krishi-indigo whitespace-pre-wrap break-words leading-relaxed">
            {parsed.marketInsight}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
