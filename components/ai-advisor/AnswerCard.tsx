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
        className="rounded-xl p-4 space-y-3"
        style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(196,106,61,0.25)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
        }}
      >
        <p 
          className="whitespace-pre-wrap break-words leading-relaxed" 
          style={{
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: 'rgba(45,42,110,0.85)',
          }}
        >
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
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,106,61,0.25)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineLightBulb size={20} className="text-green-600" />
            <h4 className="font-semibold text-green-900" style={{ fontWeight: 600 }}>
              {lang === 'hi' ? 'त्वरित उत्तर' : 'Quick Answer'}
            </h4>
          </div>
          <p 
            className="whitespace-pre-wrap break-words leading-relaxed"
            style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'rgba(45,42,110,0.85)',
            }}
          >
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
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,106,61,0.25)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AiOutlineCheckCircle size={20} className="text-blue-600" />
            <h4 className="font-semibold text-blue-900" style={{ fontWeight: 600 }}>
              {lang === 'hi' ? 'अनुशंसित कार्रवाई' : 'Recommended Action'}
            </h4>
          </div>
          <p 
            className="whitespace-pre-wrap break-words leading-relaxed"
            style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'rgba(45,42,110,0.85)',
            }}
          >
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
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,106,61,0.25)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <WiDaySunny size={24} className="text-amber-600" />
            <h4 className="font-semibold text-amber-900" style={{ fontWeight: 600 }}>
              {lang === 'hi' ? 'मौसम का प्रभाव' : 'Weather Impact'}
            </h4>
          </div>
          <p 
            className="whitespace-pre-wrap break-words leading-relaxed"
            style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'rgba(45,42,110,0.85)',
            }}
          >
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
          className="rounded-xl p-4"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,106,61,0.25)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MdStorefront size={20} className="text-purple-600" />
            <h4 className="font-semibold text-purple-900" style={{ fontWeight: 600 }}>
              {lang === 'hi' ? 'बाजार अंतर्दृष्टि' : 'Market Insight'}
            </h4>
          </div>
          <p 
            className="whitespace-pre-wrap break-words leading-relaxed"
            style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'rgba(45,42,110,0.85)',
            }}
          >
            {parsed.marketInsight}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
