'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AIMessage } from '@/lib/aiAdvisor'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import SuggestedQuestions from './SuggestedQuestions'
import ContextChips from './ContextChips'
import AIThinking from './AIThinking'

interface FarmContextPreview {
  location: string
  crop: string
  temperature: string
  mandiPrice: string
  cropStage: string
}

interface ChatWindowProps {
  messages: AIMessage[]
  loading: boolean
  onSendMessage: (content: string) => Promise<void>
  error: string | null
  onErrorDismiss: () => void
  lang: string
  farmContext: FarmContextPreview | null
}

export default function ChatWindow({
  messages,
  loading,
  onSendMessage,
  error,
  onErrorDismiss,
  lang,
  farmContext,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsSending(true)
    try {
      await onSendMessage(content)
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <motion.div 
      className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl m-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,106,61,0.25)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 14px rgba(45,42,110,0.10)',
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
    >
      {farmContext && (
        <div className="px-6 pt-4">
          <ContextChips
            location={farmContext.location}
            crop={farmContext.crop}
            temperature={farmContext.temperature}
            mandiPrice={farmContext.mandiPrice}
            cropStage={farmContext.cropStage}
          />
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 pr-2 space-y-4">
        {messages.length === 0 && !loading ? (
          <div className="h-full flex items-center justify-center">
            <SuggestedQuestions onSelectQuestion={handleSendMessage} lang={lang} />
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <MessageBubble
                key={message.id || idx}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}

            {isSending && <AIThinking lang={lang} />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-6 mb-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-start justify-between"
        >
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={onErrorDismiss}
            className="text-red-700 hover:text-red-900 ml-2"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="shrink-0 border-t p-4 pt-3" style={{ borderColor: 'rgba(196,106,61,0.25)' }}>
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isSending || loading}
          lang={lang}
        />
      </div>
    </motion.div>
  )
}
