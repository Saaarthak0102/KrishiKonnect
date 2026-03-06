'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockCommunityPosts, type CommunityPost } from '@/data/mockCommunityPosts'

interface LatestCommunityQuestionCardProps {
  farmerName?: string
  lang?: 'en' | 'hi'
}

const translations = {
  en: {
    myLatestQuestion: '🌾 My Latest Community Question',
    noQuestion: "You haven't asked the community yet.",
    askFirstQuestion: 'Ask Your First Question',
    crop: 'Crop',
    replies: 'Replies',
    posted: 'Posted',
    viewDiscussion: 'View Discussion →',
  },
  hi: {
    myLatestQuestion: '🌾 मेरा नवीनतम समुदाय प्रश्न',
    noQuestion: 'आपने अभी तक समुदाय से कोई प्रश्न नहीं पूछा है।',
    askFirstQuestion: 'अपना पहला प्रश्न पूछें',
    crop: 'फसल',
    replies: 'उत्तर',
    posted: 'पोस्ट किया गया',
    viewDiscussion: 'चर्चा देखें →',
  },
}

export default function LatestCommunityQuestionCard({
  farmerName = 'Ramesh Singh', // Default to first post's farmer for demo
  lang = 'en',
}: LatestCommunityQuestionCardProps) {
  const router = useRouter()
  const t = translations[lang]

  // Find the latest post by this farmer
  const latestPost = mockCommunityPosts.find((post) => post.farmerName === farmerName)

  const handleAskQuestion = () => {
    router.push('/community')
  }

  const handleViewDiscussion = () => {
    if (latestPost) {
      router.push(`/community/${latestPost.id}`)
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🌾</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-3">
            {t.myLatestQuestion}
          </p>

          {latestPost ? (
            <>
              {/* Question Text */}
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                "{latestPost.question}"
              </p>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div>
                  <p className="text-gray-500">{t.crop}</p>
                  <p className="font-medium text-gray-900">{latestPost.crop}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t.replies}</p>
                  <p className="font-medium text-gray-900">{latestPost.replies}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t.posted}</p>
                  <p className="font-medium text-gray-900">{latestPost.timeAgo}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {latestPost.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* View Discussion Button */}
              <button
                onClick={handleViewDiscussion}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#4F46E5' }}
              >
                {t.viewDiscussion}
              </button>
            </>
          ) : (
            <>
              {/* Empty State */}
              <p className="text-sm text-gray-600 mb-4">
                {t.noQuestion}
              </p>

              {/* Ask First Question Button */}
              <button
                onClick={handleAskQuestion}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#4F46E5' }}
              >
                {t.askFirstQuestion}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
