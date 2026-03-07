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
  onSendMessage: (content: string, imageFile?: File, imageUrl?: string) => Promise<void>
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    setIsSending(true)
    try {
      await onSendMessage(content, selectedImage || undefined)
      setSelectedImage(null)
      setImagePreview(null)
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file)
    setImagePreview(preview)
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden rounded-2xl mx-3 my-3"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,106,61,0.25)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 14px rgba(45,42,110,0.10)',
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                enableTypewriter={idx === messages.length - 1 && message.role === 'assistant'}
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

      {/* Image Preview */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-4 relative inline-block"
        >
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-32 rounded-lg border border-krishi-border"
          />
          <button
            onClick={handleClearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="border-t p-4" style={{ borderColor: 'rgba(196,106,61,0.25)' }}>
        <ChatInput
          onSendMessage={handleSendMessage}
          onImageSelect={handleImageSelect}
          disabled={isSending || loading}
          lang={lang}
        />
      </div>
    </div>
  )
}
