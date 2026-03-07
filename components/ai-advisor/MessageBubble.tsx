'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AIMessage } from '@/lib/aiAdvisor'
import { detectLanguage, toResponseLanguage } from '@/lib/languageDetector'
import AnswerCard from './AnswerCard'
import DataSources from './DataSources'

interface MessageBubbleProps {
  message: AIMessage
  isUser: boolean
  enableTypewriter?: boolean
}

export default function MessageBubble({ message, isUser, enableTypewriter = false }: MessageBubbleProps) {
  const detected = detectLanguage(message.content)
  const responseLanguage = toResponseLanguage(detected)
  const languageLabel =
    responseLanguage === 'hindi'
      ? 'Hindi'
      : responseLanguage === 'hinglish'
        ? 'Hinglish'
        : 'English'
  const lang = responseLanguage === 'hindi' ? 'hi' : 'en'

  // Typewriter effect state
  const [displayedContent, setDisplayedContent] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!isUser && enableTypewriter && message.content) {
      setIsTyping(true)
      setDisplayedContent('')
      
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < message.content.length) {
          setDisplayedContent(message.content.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsTyping(false)
          clearInterval(interval)
        }
      }, 20) // Adjust speed here (lower = faster)

      return () => clearInterval(interval)
    } else {
      setDisplayedContent(message.content)
      setIsTyping(false)
    }
  }, [message.content, isUser, enableTypewriter])

  // User message bubble
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
        className="ai-chat-message flex justify-end"
      >
        <div 
          className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-xl rounded-br-none transition-all duration-200 will-change-transform"
          style={{
            background: '#C46A3D',
            color: 'white',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            transform: 'translateZ(0)',
          }}
        >
          {/* Image if exists */}
          {message.imageUrl && (
            <div className="mb-2">
              <img
                src={message.imageUrl}
                alt="Crop analysis"
                className="max-h-48 rounded-lg border border-white/20"
              />
            </div>
          )}

          {/* Message text - preserve formatting */}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed" style={{ fontSize: '0.95rem' }}>
            {message.content}
          </p>

          {/* Timestamp */}
          <p className="text-xs mt-2 text-white/70">
            {new Date(message.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </motion.div>
    )
  }

  // AI message bubble with structured response
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="ai-chat-message flex justify-start will-change-transform"
      style={{
        transform: 'translateZ(0)',
      }}
    >
      <div 
        className="max-w-xs lg:max-w-md xl:max-w-lg w-full px-4 py-3 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.65)',
          border: '1px solid rgba(196,106,61,0.25)',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 0 10px rgba(196,106,61,0.08)',
        }}
      >
        <p className="text-xs font-semibold mb-2" style={{ color: '#2D2A6E', fontWeight: 600 }}>
          {`Language: ${languageLabel}`}
        </p>

        {/* Use AnswerCard for structured display */}
        <AnswerCard content={displayedContent} lang={lang} />

        {/* Data Sources - only show when fully typed */}
        {!isTyping && <DataSources lang={lang} />}

        {/* Timestamp */}
        <p className="text-xs mt-2 text-gray-500">
          {new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}
