'use client'

import { motion } from 'framer-motion'
import { AIChat } from '@/lib/aiAdvisor'
import { useState } from 'react'

interface SidebarProps {
  chats: AIChat[]
  currentChatId: string | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  lang: string
}

export default function AIAdvisorSidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  lang,
}: SidebarProps) {
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

  return (
    <motion.div
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      className="w-64 bg-white/70 backdrop-blur-md border-r border-krishi-border overflow-y-auto shadow-sm h-full flex flex-col"
    >
      {/* New Chat Button */}
      <div className="p-4 border-b border-krishi-border">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-3 bg-krishi-primary text-white rounded-lg font-semibold hover:bg-krishi-primary/90 transition-all flex items-center justify-center space-x-2"
        >
          <span>+</span>
          <span>{lang === 'hi' ? 'नई चैट' : 'New Chat'}</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-krishi-text/60 text-sm">
              {lang === 'hi' ? 'कोई चैट नहीं' : 'No chats yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                layout
                onMouseEnter={() => setHoveredId(chat.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  currentChatId === chat.id
                    ? 'bg-krishi-primary/10 border-l-4 border-krishi-primary'
                    : 'hover:bg-white/45'
                }`}
              >
                <div onClick={() => onSelectChat(chat.id)} className="flex-1">
                  <p className="text-sm font-medium text-krishi-text truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs text-krishi-text/60 mt-1">
                    {formatDate(chat.createdAt)}
                  </p>
                </div>

                {/* Delete button */}
                {(hoveredId === chat.id || showDeleteConfirm === chat.id) && (
                  <div className="absolute right-2 top-2">
                    {showDeleteConfirm === chat.id ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteChat(chat.id)
                            setShowDeleteConfirm(null)
                          }}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          title={lang === 'hi' ? 'हाँ, हटाएं' : 'Yes, delete'}
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(null)
                          }}
                          className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs"
                          title={lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(chat.id)
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title={lang === 'hi' ? 'हटाएं' : 'Delete'}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-krishi-border text-xs text-krishi-text/60 text-center">
        <p>Krishi Sahayak 🌾</p>
        <p className="mt-1">{lang === 'hi' ? 'कृषि सहायक' : 'AI Farming Advisor'}</p>
      </div>
    </motion.div>
  )
}
