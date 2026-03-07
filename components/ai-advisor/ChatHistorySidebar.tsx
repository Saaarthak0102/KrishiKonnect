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
      className="w-80 overflow-hidden flex flex-col shadow-lg h-full"
      style={{
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(196,106,61,0.25)',
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b"
        style={{ borderColor: 'rgba(196,106,61,0.25)' }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">🌾</span>
          <div>
            <h2 className="font-bold text-sm">
              {lang === 'hi' ? (
                <>
                  <span style={{ color: '#2D2A6E' }}>कृषि</span>
                  {' '}
                  <span style={{ color: '#C46A3D' }}>सहायक</span>
                </>
              ) : (
                <>
                  <span style={{ color: '#2D2A6E' }}>Krishi</span>
                  {' '}
                  <span style={{ color: '#C46A3D' }}>Sahayak</span>
                </>
              )}
            </h2>
            <p className="text-xs text-gray-500">
              {lang === 'hi' ? 'AI सहायक' : 'AI Assistant'}
            </p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b" style={{ borderColor: 'rgba(196,106,61,0.25)' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewChat}
          className="w-full px-4 py-2.5 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm"
          style={{
            background: '#C46A3D',
            boxShadow: '0 4px 12px rgba(196,106,61,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#b35f35'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#C46A3D'
          }}
        >
          <span>+</span>
          <span>{lang === 'hi' ? 'नई चैट' : 'New Chat'}</span>
        </motion.button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center py-12">
            <p className="text-sm text-gray-500">
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
                <motion.button
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex flex-col ${
                    currentChatId === chat.id
                      ? 'border-l-4'
                      : 'border-l-4'
                  }`}
                  style={
                    currentChatId === chat.id
                      ? {
                          background: 'rgba(255,255,255,0.6)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          borderLeftColor: '#C46A3D',
                          boxShadow: '0 4px 12px rgba(196,106,61,0.2)',
                        }
                      : {
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          borderLeftColor: 'transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (currentChatId !== chat.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentChatId !== chat.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <span className="font-semibold text-sm truncate" style={{ color: '#2D2A6E' }}>
                    {getTruncatedTitle(chat.title)}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {formatDate(chat.createdAt)}
                  </span>
                </motion.button>

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
      <div 
        className="p-3 border-t text-xs text-gray-400 text-center"
        style={{
          borderColor: 'rgba(196,106,61,0.25)',
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        {lang === 'hi' ? 'आपकी पिछली चैट' : 'Your chat history'}
      </div>
    </motion.div>
  )
}
