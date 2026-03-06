'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AIChat, subscribeToChats } from '@/lib/aiAdvisor'

interface ChatHistorySidebarProps {
  chats: AIChat[]
  currentChatId: string | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  lang: string
  userId?: string
}

export default function ChatHistorySidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  lang,
  userId,
}: ChatHistorySidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (d.toDateString() === yesterday.toDateString()) {
      return lang === 'hi' ? 'कल' : 'Yesterday'
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTruncatedTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="w-80 bg-white border-l border-krishi-border overflow-hidden flex flex-col shadow-sm h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-krishi-border bg-gradient-to-r from-krishi-primary/5 to-krishi-agriculture/5">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">🌾</span>
          <div>
            <h2 className="font-bold text-sm">
              {lang === 'hi' ? (
                <>
                  <span className="text-[#2D4B8C]">कृषि</span>
                  {' '}
                  <span className="text-[#C96A3A]">सहायक</span>
                </>
              ) : (
                <>
                  <span className="text-[#2D4B8C]">Krishi</span>
                  {' '}
                  <span className="text-[#C96A3A]">Sahayak</span>
                </>
              )}
            </h2>
            <p className="text-xs text-krishi-text/60">
              {lang === 'hi' ? (
                <>
                  <span className="text-[#2D4B8C]">कृषि</span>
                  {' '}
                  <span className="text-[#C96A3A]">सहायक</span>
                </>
              ) : (
                <>
                  <span className="text-[#2D4B8C]">Krishi</span>
                  {' '}
                  <span className="text-[#C96A3A]">Sahayak</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-krishi-border">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2.5 bg-krishi-primary text-white rounded-lg font-semibold hover:bg-krishi-primary/90 transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <span>+</span>
          <span>{lang === 'hi' ? 'नई चैट' : 'New Chat'}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center py-12">
            <p className="text-sm text-krishi-text/60">
              {lang === 'hi' ? 'कोई चैट नहीं' : 'No chats yet'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onMouseEnter={() => setHoveredId(chat.id)}
                onMouseLeave={() => {
                  setHoveredId(null)
                  setShowDeleteConfirm(null)
                }}
                className={`relative group`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex flex-col ${
                    currentChatId === chat.id
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <span className="font-semibold text-sm text-krishi-heading truncate">
                    {getTruncatedTitle(chat.title)}
                  </span>
                  <span className="text-xs text-krishi-text/60 truncate">
                    {formatDate(chat.createdAt)}
                  </span>
                </button>

                {/* Delete Button - Shows on Hover */}
                {hoveredId === chat.id && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() =>
                      showDeleteConfirm === chat.id
                        ? (onDeleteChat(chat.id), setShowDeleteConfirm(null))
                        : setShowDeleteConfirm(chat.id)
                    }
                    className="absolute right-3 top-2.5 p-1.5 rounded hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                    title={lang === 'hi' ? 'हटाएं' : 'Delete'}
                  >
                    {showDeleteConfirm === chat.id ? '✓' : '×'}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-krishi-border bg-gray-50 text-xs text-krishi-text/50 text-center">
        {lang === 'hi' ? 'आपकी पिछली चैट' : 'Your chat history'}
      </div>
    </motion.div>
  )
}
