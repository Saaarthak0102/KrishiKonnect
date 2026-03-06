'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

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
        <textarea
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
          className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg resize-none focus:border-krishi-primary outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        {/* Image Upload Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-krishi-highlight/20 text-krishi-highlight rounded-lg border border-krishi-highlight/30 hover:bg-krishi-highlight/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
          title={
            lang === 'hi'
              ? 'फसल की छवि अपलोड करें'
              : 'Upload crop image for analysis'
          }
        >
          <span>📸</span>
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={disabled || isLoading || !message.trim()}
          className="flex items-center space-x-2 px-6 py-2 bg-krishi-primary text-white rounded-lg hover:bg-krishi-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
        >
          <span>{isLoading ? '...' : lang === 'hi' ? 'भेजें' : 'Send'}</span>
          <span>→</span>
        </motion.button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-krishi-text/60">
        {lang === 'hi'
          ? '💡 फसल की बीमारी, कीटों, सिंचाई, उर्वरक आदि के बारे में सवाल पूछें'
          : '💡 Ask questions about crop diseases, pests, irrigation, fertilizers, etc.'}
      </p>
    </div>
  )
}
