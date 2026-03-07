'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiImage, FiSend } from 'react-icons/fi'

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>
  onImageSelect: (file: File, preview: string) => void
  disabled: boolean
  lang: string
}

export default function ChatInput({
  onSendMessage,
  onImageSelect,
  disabled,
  lang,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    try {
      await onSendMessage(message)
      setMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(lang === 'hi' ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'hi' ? 'छवि 5MB से बड़ी नहीं हो सकती' : 'Image must be smaller than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = event.target?.result as string
      onImageSelect(file, preview)
    }
    reader.readAsDataURL(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div className="relative">
        <motion.textarea
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || isLoading}
          placeholder={
            lang === 'hi'
              ? 'अपना खेती से जुड़ा सवाल पूछें...'
              : 'Ask your farming question...'
          }
          rows={3}
          className="w-full px-4 py-3 rounded-xl resize-none outline-none disabled:cursor-not-allowed transition-all will-change-transform"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(196,106,61,0.25)',
            fontSize: '0.95rem',
            color: '#2D2A6E',
            transform: 'translateZ(0)',
          }}
          onFocus={(e) => {
            e.target.style.border = '1px solid rgba(196,106,61,0.45)'
            e.target.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.12)'
            e.target.style.transform = 'translateY(-1px)'
          }}
          onBlur={(e) => {
            e.target.style.border = '1px solid rgba(196,106,61,0.25)'
            e.target.style.boxShadow = 'none'
            e.target.style.transform = 'translateY(0)'
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        {/* Image Upload Button */}
        <motion.button
          whileHover={{ y: -1, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm will-change-transform"
          style={{
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(196,106,61,0.3)',
            color: '#2D2A6E',
            transform: 'translateZ(0)',
          }}
          title={
            lang === 'hi'
              ? 'फसल की छवि अपलोड करें'
              : 'Upload crop image for analysis'
          }
        >
          <FiImage size={18} />
          <span>{lang === 'hi' ? 'छवि' : 'Image'}</span>
        </motion.button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Send Button */}
        <motion.button
          whileHover={
            !disabled && !isLoading && message.trim()
              ? { 
                  y: -2, 
                  scale: 1.03,
                  boxShadow: '0 10px 22px rgba(45,42,110,0.20), 0 0 10px rgba(45,42,110,0.12)',
                }
              : {}
          }
          whileTap={{ scale: 0.98 }}
          onClick={handleSendMessage}
          disabled={disabled || isLoading || !message.trim()}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm will-change-transform"
          style={{
            background: '#2D2A6E',
            boxShadow: '0 6px 16px rgba(45,42,110,0.25)',
            transform: 'translateZ(0)',
          }}
        >
          <span>{isLoading ? '...' : lang === 'hi' ? 'भेजें' : 'Send'}</span>
          <FiSend size={18} />
        </motion.button>
      </div>

      {/* Help Text */}
      <p className="text-xs" style={{ color: 'rgba(45,42,110,0.6)' }}>
        {lang === 'hi'
          ? '💡 फसल की बीमारी, कीटों, सिंचाई, उर्वरक आदि के बारे में सवाल पूछें'
          : '💡 Ask questions about crop diseases, pests, irrigation, fertilizers, etc.'}
      </p>
    </div>
  )
}
