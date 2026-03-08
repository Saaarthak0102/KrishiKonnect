'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { subscribeToLatestQuestion } from '@/lib/community'
import { getShortTime } from '@/lib/timeUtils'
import { GiPlantRoots } from 'react-icons/gi'
import { FiClock, FiMessageCircle } from 'react-icons/fi'
import { FaUsers } from 'react-icons/fa'

interface LatestCommunityQuestionCardProps {
  farmerName?: string
  lang?: 'en' | 'hi'
}

interface QuestionData {
  id: string
  questionText: string
  title_en?: string
  title_hi?: string
  description: string
  crop?: string
  cropTag: string
  cropTag_en?: string
  cropTag_hi?: string
  cropEmoji: string
  replies?: number
  repliesCount: number
  createdAt: Date
}

const translations = {
  en: {
    title: 'Latest Krishi Sangh Question',
    message: 'No Krishi Sangh question yet.',
    button: 'Ask Krishi Sangh',
    viewDiscussion: 'View Discussion →',
    replies: 'replies',
    reply: 'reply',
  },
  hi: {
    title: 'नवीनतम कृषि संघ प्रश्न',
    message: 'अभी तक कोई कृषि संघ प्रश्न नहीं है।',
    button: 'कृषि संघ से पूछें',
    viewDiscussion: 'चर्चा देखें →',
    replies: 'उत्तर',
    reply: 'उत्तर',
  },
}

function timestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null
  if (timestamp instanceof Date) return timestamp
  if (timestamp?.toDate) return timestamp.toDate()
  if (typeof timestamp === 'number') return new Date(timestamp)
  return null
}

export default function LatestCommunityQuestionCard({
  lang = 'en',
}: LatestCommunityQuestionCardProps) {
  const router = useRouter()
  const t = translations[lang]
  const [latestQuestion, setLatestQuestion] = useState<QuestionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToLatestQuestion(
      (question) => {
        if (!question) {
          setLatestQuestion(null)
          setLoading(false)
          return
        }

        setLatestQuestion({
          id: question.id,
          questionText: question.questionText || '',
          title_en: question.title_en,
          title_hi: question.title_hi,
          description: question.description || '',
          crop: question.crop,
          cropTag: question.cropTag || '',
          cropTag_en: question.cropTag_en,
          cropTag_hi: question.cropTag_hi,
          cropEmoji: question.cropEmoji || '🌾',
          replies: question.replies || 0,
          repliesCount: question.repliesCount || 0,
          createdAt: timestampToDate(question.createdAt) || new Date(),
        })
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching latest question:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleClick = () => {
    if (latestQuestion) {
      router.push(`/community/${latestQuestion.id}`)
    } else {
      router.push('/community')
    }
  }

  // Truncate question text to ~80-100 characters
  const getTruncatedText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const latestQuestionText =
    lang === 'hi'
      ? latestQuestion?.title_hi || latestQuestion?.questionText || ''
      : latestQuestion?.title_en || latestQuestion?.questionText || ''

  const latestQuestionCrop =
    lang === 'hi'
      ? latestQuestion?.cropTag_hi || latestQuestion?.cropTag || latestQuestion?.crop || ''
      : latestQuestion?.cropTag_en || latestQuestion?.cropTag || latestQuestion?.crop || ''

  const replyCount = latestQuestion?.repliesCount || latestQuestion?.replies || 0

  if (loading) {
    return (
      <div className="dashboard-card" style={{
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(196,106,61,0.35)',
        borderRadius: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(45,42,110,0.08) inset',
        padding: '16px'
      }}>
        <div className="animate-pulse">
          <div style={{ height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '75%', marginBottom: '12px' }}></div>
          <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '100%', marginBottom: '8px' }}></div>
          <div style={{ height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px', width: '83%' }}></div>
        </div>
      </div>
    )
  }

  if (!latestQuestion) {
    // Empty state
    return (
      <div className="dashboard-card" style={{
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(196,106,61,0.35)',
        borderRadius: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(45,42,110,0.08) inset',
        padding: '16px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#2D2A6E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaUsers className="text-[#C46A3D]" size={20} />
          {t.title}
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(45,42,110,0.7)', marginBottom: '16px' }}>
          {t.message}
        </p>
        <button
          onClick={handleClick}
          style={{
            width: '100%',
            backgroundColor: '#2D2A6E',
            color: 'white',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#3a378a'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(45,42,110,0.25)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2D2A6E'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t.button}
        </button>
      </div>
    )
  }

  // Display question
  return (
    <div className="dashboard-card" style={{
      background: 'rgba(255,255,255,0.45)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(196,106,61,0.35)',
      borderRadius: '14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(45,42,110,0.08) inset',
      padding: '16px'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#2D2A6E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaUsers className="text-[#C46A3D]" size={20} />
        {t.title}
      </h3>

      <div className="space-y-3">
        {/* Question Preview */}
        <div>
          <p style={{ fontSize: '14px', color: '#2D2A6E', lineHeight: '1.6', marginBottom: '8px', fontWeight: 500 }}>
            {getTruncatedText(latestQuestionText)}
          </p>
          {latestQuestion.description && (
            <p style={{ fontSize: '12px', color: 'rgba(45,42,110,0.7)', lineHeight: '1.6' }}>
              {getTruncatedText(latestQuestion.description, 80)}
            </p>
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(45,42,110,0.7)' }}>
          {/* Crop Tag */}
          <span style={{
            backgroundColor: 'rgba(196,106,61,0.15)',
            color: '#C46A3D',
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <GiPlantRoots className="text-[#C46A3D]" size={16} /> {latestQuestionCrop}
          </span>

          {/* Replies Count */}
          <span className="inline-flex items-center gap-1">
            <FiMessageCircle className="text-[#C46A3D]" size={16} /> {replyCount} {replyCount === 1 ? t.reply : t.replies}
          </span>

          {/* Time Posted */}
          <span className="inline-flex items-center gap-1">
            <FiClock className="text-[#C46A3D]" size={16} /> {getShortTime(latestQuestion.createdAt)}
          </span>
        </div>

        {/* View Discussion Button */}
        <button
          onClick={handleClick}
          style={{
            width: '100%',
            backgroundColor: '#2D2A6E',
            color: 'white',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#3a378a'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(45,42,110,0.25)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2D2A6E'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {t.viewDiscussion}
        </button>
      </div>
    </div>
  )
}
