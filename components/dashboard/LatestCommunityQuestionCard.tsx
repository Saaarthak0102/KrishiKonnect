'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getShortTime } from '@/lib/timeUtils'

interface LatestCommunityQuestionCardProps {
  farmerName?: string
  lang?: 'en' | 'hi'
}

interface QuestionData {
  id: string
  questionText: string
  description: string
  cropTag: string
  cropEmoji: string
  repliesCount: number
  createdAt: Date
}

const translations = {
  en: {
    title: 'My Latest Community Question',
    message: "You haven't asked the community yet.",
    button: 'Ask the Community',
    viewDiscussion: 'View Discussion →',
    replies: 'replies',
    reply: 'reply',
  },
  hi: {
    title: 'मेरा नवीनतम समुदाय प्रश्न',
    message: 'आपने अभी तक समुदाय से कोई प्रश्न नहीं पूछा है।',
    button: 'समुदाय से पूछें',
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
  const { user } = useAuth()
  const t = translations[lang]
  const [latestQuestion, setLatestQuestion] = useState<QuestionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    // Subscribe to user's latest question
    const questionsRef = collection(db, 'community_questions')
    const q = query(
      questionsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          const data = doc.data()
          setLatestQuestion({
            id: doc.id,
            questionText: data.questionText || '',
            description: data.description || '',
            cropTag: data.cropTag || '',
            cropEmoji: data.cropEmoji || '🌾',
            repliesCount: data.repliesCount || 0,
            createdAt: timestampToDate(data.createdAt) || new Date(),
          })
        } else {
          setLatestQuestion(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching latest question:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

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

  if (!latestQuestion) {
    // Empty state
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-xl shadow-sm p-4">
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
    <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>🌾</span>
        {t.title}
      </h3>

      <div className="space-y-3">
        {/* Question Preview */}
        <div>
          <p className="text-gray-800 text-sm leading-relaxed mb-2">
            {getTruncatedText(latestQuestion.questionText)}
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
            {latestQuestion.cropEmoji} {latestQuestion.cropTag}
          </span>

          {/* Replies Count */}
          <span className="inline-flex items-center gap-1">
            💬 {latestQuestion.repliesCount} {latestQuestion.repliesCount === 1 ? t.reply : t.replies}
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
