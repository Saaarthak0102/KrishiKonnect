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
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(45,42,110,0.35), rgba(196,106,61,0.28)), rgba(255,255,255,0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '1px solid rgba(196,106,61,0.30)',
          boxShadow: '0 14px 36px rgba(0,0,0,0.10), 0 0 16px rgba(45,42,110,0.12), 0 0 10px rgba(196,106,61,0.10)',
          padding: '16px',
          transition: 'all 0.25s ease'
        }}
      >
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
        style={{
          background: 'linear-gradient(135deg, rgba(45,42,110,0.35), rgba(196,106,61,0.28)), rgba(255,255,255,0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '1px solid rgba(196,106,61,0.30)',
          boxShadow: '0 14px 36px rgba(0,0,0,0.10), 0 0 16px rgba(45,42,110,0.12), 0 0 10px rgba(196,106,61,0.10)',
          padding: '16px',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,0,0,0.12), 0 0 20px rgba(45,42,110,0.15), 0 0 14px rgba(196,106,61,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.10), 0 0 16px rgba(45,42,110,0.12), 0 0 10px rgba(196,106,61,0.10)'
        }}
      >
        <div className="mb-3">
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#2D2A6E', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 10px rgba(45,42,110,0.12)' }}>
            <HiSparkles size={22} style={{ color: '#2D2A6E', opacity: 0.9 }} />
            {t.title}
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(45,42,110,0.75)', fontWeight: 500, marginTop: '4px' }}>{t.subtitle}</p>
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
              background: 'rgba(45,42,110,0.90)',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.15)',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
              e.currentTarget.style.background = '#3a378a'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(45,42,110,0.30), 0 0 14px rgba(45,42,110,0.20)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.background = 'rgba(45,42,110,0.90)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.15)'
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
        style={{
          background: 'linear-gradient(135deg, rgba(45,42,110,0.35), rgba(196,106,61,0.28)), rgba(255,255,255,0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '18px',
          border: '1px solid rgba(196,106,61,0.30)',
          boxShadow: '0 14px 36px rgba(0,0,0,0.10), 0 0 16px rgba(45,42,110,0.12), 0 0 10px rgba(196,106,61,0.10)',
          padding: '16px',
          transition: 'all 0.25s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,0,0,0.12), 0 0 20px rgba(45,42,110,0.15), 0 0 14px rgba(196,106,61,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.10), 0 0 16px rgba(45,42,110,0.12), 0 0 10px rgba(196,106,61,0.10)'
        }}
      >
        <div className="mb-3">
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#2D2A6E', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 10px rgba(45,42,110,0.12)' }}>
            <HiSparkles size={22} style={{ color: '#2D2A6E', opacity: 0.9 }} />
            {t.title}
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(45,42,110,0.75)', fontWeight: 500, marginTop: '4px' }}>{t.subtitle}</p>
        </div>

        <div className="space-y-3">
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#2D2A6E', lineHeight: '1.6' }}>
            {MOCK_CHAT_FALLBACK.title}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(45,42,110,0.7)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌽 {MOCK_CHAT_FALLBACK.crop}</span>
            <span>•</span>
            <span>{MOCK_CHAT_FALLBACK.updatedAtLabel}</span>
          </p>

          <button
            onClick={handleClick}
            style={{
              width: '100%',
              background: 'rgba(45,42,110,0.90)',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.15)',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
              e.currentTarget.style.background = '#3a378a'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(45,42,110,0.30), 0 0 14px rgba(45,42,110,0.20)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.background = 'rgba(45,42,110,0.90)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.15)'
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
      style={{
        background: 'linear-gradient(135deg, rgba(45,42,110,0.35), rgba(196,106,61,0.28)), rgba(255,255,255,0.35)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '18px',
        border: '1px solid rgba(196,106,61,0.30)',
        boxShadow: '0 14px 36px rgba(0,0,0,0.10), 0 0 16px rgba(45,42,110,0.12), 0 0 10px rgba(196,106,61,0.10)',
        padding: '16px',
        transition: 'all 0.25s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,0,0,0.12), 0 0 20px rgba(45,42,110,0.15), 0 0 14px rgba(196,106,61,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.10), 0 0 16px rgba(45,42,110,0.12), 0 0 10px rgba(196,106,61,0.10)'
      }}
    >
      <div className="mb-3">
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#2D2A6E', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 10px rgba(45,42,110,0.12)' }}>
          <HiSparkles size={22} style={{ color: '#2D2A6E', opacity: 0.9 }} />
          {t.title}
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'rgba(45,42,110,0.75)', fontWeight: 500, marginTop: '4px' }}>{t.subtitle}</p>
      </div>

      <div className="space-y-3">
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#2D2A6E', lineHeight: '1.6' }}>
          {previewText || MOCK_CHAT_FALLBACK.title}
        </p>

        <div style={{ fontSize: '12px', color: 'rgba(45,42,110,0.7)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {cropTag ? <span>🌽 {cropTag}</span> : null}
          {cropTag ? <span>•</span> : null}
          <span>{getShortTime(chat.updatedAt || chat.createdAt)}</span>
        </div>

        <button
          onClick={handleClick}
          style={{
            width: '100%',
            background: 'rgba(45,42,110,0.90)',
            color: 'white',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.15)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.25s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
            e.currentTarget.style.background = '#3a378a'
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(45,42,110,0.30), 0 0 14px rgba(45,42,110,0.20)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.background = 'rgba(45,42,110,0.90)'
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.15)'
          }}
        >
          {t.continueChat}
        </button>
      </div>
    </div>
  )
}
