'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { subscribeToLatestAIChat, type AIChat } from '@/lib/aiAdvisor'
import { getShortTime } from '@/lib/timeUtils'

interface LatestAIChatCardProps {
  userId: string
  lang?: 'en' | 'hi'
}

const translations = {
  en: {
    title: 'Latest KrishiSahayak Chat',
    subtitle: 'Your last AI farming consultation',
    emptyLine1: "You haven't asked KrishiSahayak yet.",
    emptyLine2: 'Get instant farming advice from AI.',
    continueChat: 'Continue Chat →',
    startChat: 'Start Chat →',
  },
  hi: {
    title: 'नवीनतम कृषि सहायक चैट',
    subtitle: 'आपकी पिछली एआई खेती सलाह',
    emptyLine1: 'आपने अभी तक कृषि सहायक से नहीं पूछा है।',
    emptyLine2: 'एआई से तुरंत खेती सलाह पाएं।',
    continueChat: 'चैट जारी रखें →',
    startChat: 'चैट शुरू करें →',
  },
}

const MOCK_CHAT_FALLBACK = {
  title: 'How to increase maize yield?',
  crop: 'Maize',
  updatedAtLabel: '2h ago',
}

export default function LatestAIChatCard({
  userId,
  lang = 'en',
}: LatestAIChatCardProps) {
  const router = useRouter()
  const t = translations[lang]
  const [latestChat, setLatestChat] = useState<AIChat | null>(null)
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null)
  const [hasFirestoreError, setHasFirestoreError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToLatestAIChat(
      userId,
      (chat, questionPreview) => {
        setLatestChat(chat)
        setFirstQuestion(questionPreview)
        setHasFirestoreError(false)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching latest AI chat:', error)
        setHasFirestoreError(true)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const handleClick = () => {
    if (latestChat) {
      router.push(`/ai-advisor?chatId=${latestChat.id}`)
    } else {
      router.push('/ai-advisor')
    }
  }

  const getTruncatedText = (text: string, maxLength: number = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const previewText = getTruncatedText(
    latestChat?.title?.trim() || firstQuestion?.trim() || latestChat?.lastMessage?.trim() || '',
    95
  )

  const cropTag = latestChat?.crop?.trim() || ''

  const isEmptyState = !latestChat && !hasFirestoreError

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-xl shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (isEmptyState) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-xl shadow-sm p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span>🤖</span>
            {t.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">{t.emptyLine1}</p>
            <p className="text-sm text-gray-600">{t.emptyLine2}</p>
          </div>

          <button
            onClick={handleClick}
            className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {t.startChat}
          </button>
        </div>
      </div>
    )
  }

  if (!latestChat && hasFirestoreError) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-xl shadow-sm p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span>🤖</span>
            {t.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-800 leading-relaxed">
            {MOCK_CHAT_FALLBACK.title}
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <span>🌽 {MOCK_CHAT_FALLBACK.crop}</span>
            <span>•</span>
            <span>{MOCK_CHAT_FALLBACK.updatedAtLabel}</span>
          </p>

          <button
            onClick={handleClick}
            className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {t.continueChat}
          </button>
        </div>
      </div>
    )
  }

  const chat = latestChat as AIChat

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-xl shadow-sm p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span>🤖</span>
          {t.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-800 leading-relaxed">
          {previewText || MOCK_CHAT_FALLBACK.title}
        </p>

        <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
          {cropTag ? <span>🌽 {cropTag}</span> : null}
          {cropTag ? <span>•</span> : null}
          <span>{getShortTime(chat.updatedAt || chat.createdAt)}</span>
        </div>

        <button
          onClick={handleClick}
          className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
        >
          {t.continueChat}
        </button>
      </div>
    </div>
  )
}
