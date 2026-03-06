'use client'

import { motion } from 'framer-motion'
import { AIMessage } from '@/lib/aiAdvisor'

interface MessageBubbleProps {
  message: AIMessage
  isUser: boolean
}

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-krishi-primary text-white rounded-br-none'
            : 'bg-krishi-agriculture/10 text-krishi-text rounded-bl-none border border-krishi-agriculture/20'
        }`}
      >
        {/* Image if exists */}
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Crop analysis"
              className="max-h-48 rounded-lg border border-krishi-border"
            />
          </div>
        )}

        {/* Message text - preserve formatting */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>

        {/* Timestamp */}
        <p
          className={`text-xs mt-2 ${
            isUser ? 'text-white/70' : 'text-krishi-text/60'
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}
