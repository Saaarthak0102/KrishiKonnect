'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { subscribeToLatestAIChat, type AIChat } from '@/lib/aiAdvisor'
import { getShortTime } from '@/lib/timeUtils'
import { HiSparkles } from 'react-icons/hi'

interface LatestAIChatCardProps {
  userId: string
  lang?: 'en' | 'hi'
}

const translations = {
  en: {
    title: 'Latest Krishi Sahayak Chat',
    subtitle: 'Your last AI farming consultation',
    emptyLine1: "You haven't asked Krishi Sahayak yet.",
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

const cardClassName =
  'dashboard-card rounded-2xl border border-[#C46A3D]/20 bg-white/60 backdrop-blur-md shadow-sm'

const cardStyle = {
  padding: '16px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  transition: 'all 0.25s ease',
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
      <div className={cardClassName} style={cardStyle}>
        <div className="animate-pulse">
          <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '75%', marginBottom: '12px' }}></div>
          <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '100%', marginBottom: '8px' }}></div>
          <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '83%' }}></div>
        </div>
      </div>
    )
  }

  if (isEmptyState) {
    return (
      <div
        className={cardClassName}
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'
        }}
      >
        <div className="mb-3">
          <h3 className="text-[#2D2A6E] font-semibold" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiSparkles size={22} style={{ color: '#C46A3D' }} />
            {t.title}
          </h3>
          <p className="text-gray-600" style={{ fontSize: '0.95rem', marginTop: '4px' }}>{t.subtitle}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <p style={{ fontSize: '14px', color: 'rgba(45,42,110,0.7)' }}>{t.emptyLine1}</p>
            <p style={{ fontSize: '14px', color: 'rgba(45,42,110,0.7)' }}>{t.emptyLine2}</p>
          </div>

          <button
            onClick={handleClick}
            style={{
              width: '100%',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: '#2D2A6E',
              transition: 'all 0.25s ease'
            }}
            className="bg-[#2D2A6E] text-white rounded-xl hover:bg-[#25235c] transition"
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
              e.currentTarget.style.backgroundColor = '#25235c'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(45,42,110,0.25)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.backgroundColor = '#2D2A6E'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {t.startChat}
          </button>
        </div>
      </div>
    )
  }

  if (!latestChat && hasFirestoreError) {
    return (
      <div
        className={cardClassName}
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'
        }}
      >
        <div className="mb-3">
          <h3 className="text-[#2D2A6E] font-semibold" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiSparkles size={22} style={{ color: '#C46A3D' }} />
            {t.title}
          </h3>
          <p className="text-gray-600" style={{ fontSize: '0.95rem', marginTop: '4px' }}>{t.subtitle}</p>
        </div>

        <div className="space-y-3">
          <p className="text-[#2D2A6E] font-medium" style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {MOCK_CHAT_FALLBACK.title}
          </p>
          <p className="text-gray-400 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌽 {MOCK_CHAT_FALLBACK.crop}</span>
            <span>•</span>
            <span>{MOCK_CHAT_FALLBACK.updatedAtLabel}</span>
          </p>

          <button
            onClick={handleClick}
            style={{
              width: '100%',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: '#2D2A6E',
              transition: 'all 0.25s ease'
            }}
            className="bg-[#2D2A6E] text-white rounded-xl hover:bg-[#25235c] transition"
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
              e.currentTarget.style.backgroundColor = '#25235c'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(45,42,110,0.25)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.backgroundColor = '#2D2A6E'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {t.continueChat}
          </button>
        </div>
      </div>
    )
  }

  const chat = latestChat as AIChat

  return (
    <div
      className={cardClassName}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'
      }}
    >
      <div className="mb-3">
        <h3 className="text-[#2D2A6E] font-semibold" style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiSparkles size={22} style={{ color: '#C46A3D' }} />
          {t.title}
        </h3>
        <p className="text-gray-600" style={{ fontSize: '0.95rem', marginTop: '4px' }}>{t.subtitle}</p>
      </div>

      <div className="space-y-3">
        <p className="text-[#2D2A6E] font-medium" style={{ fontSize: '14px', lineHeight: '1.6' }}>
          {previewText || MOCK_CHAT_FALLBACK.title}
        </p>

        <div className="text-gray-400 text-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {cropTag ? <span>🌽 {cropTag}</span> : null}
          {cropTag ? <span>•</span> : null}
          <span>{getShortTime(chat.updatedAt || chat.createdAt)}</span>
        </div>

        <button
          onClick={handleClick}
          style={{
            width: '100%',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            backgroundColor: '#2D2A6E',
            transition: 'all 0.25s ease'
          }}
          className="bg-[#2D2A6E] text-white rounded-xl hover:bg-[#25235c] transition"
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
            e.currentTarget.style.backgroundColor = '#25235c'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(45,42,110,0.25)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.backgroundColor = '#2D2A6E'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t.continueChat}
        </button>
      </div>
    </div>
  )
}
