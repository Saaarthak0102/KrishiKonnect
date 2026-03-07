'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { subscribeToLatestQuestion } from '@/lib/community'
import { getShortTime } from '@/lib/timeUtils'

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
      <div className="bg-white/45 backdrop-blur-md border border-indigo-200/40 rounded-xl shadow-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (!latestQuestion) {
    // Empty state
    return (
      <div className="bg-white/45 backdrop-blur-md border border-indigo-200/40 rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🌾</span>
          {t.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t.message}
        </p>
        <button
          onClick={handleClick}
          className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
        >
          {t.button}
        </button>
      </div>
    )
  }

  // Display question
  return (
    <div className="bg-white/45 backdrop-blur-md border border-indigo-200/40 rounded-xl shadow-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>🌾</span>
        {t.title}
      </h3>

      <div className="space-y-3">
        {/* Question Preview */}
        <div>
          <p className="text-gray-800 text-sm leading-relaxed mb-2">
            {getTruncatedText(latestQuestionText)}
          </p>
          {latestQuestion.description && (
            <p className="text-gray-600 text-xs leading-relaxed">
              {getTruncatedText(latestQuestion.description, 80)}
            </p>
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {/* Crop Tag */}
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium inline-flex items-center gap-1">
            {latestQuestion.cropEmoji} {latestQuestionCrop}
          </span>

          {/* Replies Count */}
          <span className="inline-flex items-center gap-1">
            💬 {replyCount} {replyCount === 1 ? t.reply : t.replies}
          </span>

          {/* Time Posted */}
          <span className="inline-flex items-center gap-1">
            🕒 {getShortTime(latestQuestion.createdAt)}
          </span>
        </div>

        {/* View Discussion Button */}
        <button
          onClick={handleClick}
          className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
        >
          {t.viewDiscussion}
        </button>
      </div>
    </div>
  )
}
