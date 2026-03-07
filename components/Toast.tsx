'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
  type?: 'success' | 'error' | 'info'
}

export default function Toast({
  message,
  isVisible,
  onClose,
  duration = 3000,
  type = 'success',
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const bgColor = {
    success: 'bg-white/50 backdrop-blur-md border-green-300/40',
    error: 'bg-white/50 backdrop-blur-md border-red-300/40',
    info: 'bg-white/50 backdrop-blur-md border-blue-300/40',
  }[type]

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl border ${bgColor} ${textColor} font-medium max-w-sm shadow-lg`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
