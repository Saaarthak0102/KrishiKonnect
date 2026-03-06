'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FeaturePageLayout from '@/components/FeaturePageLayout';
import ThreadView from '@/components/community/ThreadView';

interface Reply {
  id: string;
  userId: string;
  user: string;
  text: string;
  upvotes: number;
  timestamp: string;
  image?: string | null;
}

interface Question {
  id: string;
  crop: string;
  cropEmoji: string;
  question: string;
  description: string;
  user: string;
  userId: string;
  upvotes: number;
  repliesCount: number;
  timestamp: string;
  image?: string | null;
  hasImage?: boolean;
  replies: Reply[];
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [upvotedQuestions, setUpvotedQuestions] = useState<Set<string>>(new Set());
  const [upvotedReplies, setUpvotedReplies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load question from JSON file
  useEffect(() => {
    fetch('/data/communityQuestions.json')
      .then((res) => res.json())
      .then((data: Question[]) => {
        const foundQuestion = data.find((q) => q.id === questionId);
        if (foundQuestion) {
          setQuestion(foundQuestion);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading question:', error);
        setLoading(false);
      });
  }, [questionId]);

  const handleUpvoteQuestion = (id: string) => {
    if (!question) return;

    if (upvotedQuestions.has(id)) {
      setUpvotedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setQuestion({ ...question, upvotes: question.upvotes - 1 });
    } else {
      setUpvotedQuestions((prev) => new Set(prev).add(id));
      setQuestion({ ...question, upvotes: question.upvotes + 1 });
    }
  };

  const handleUpvoteReply = (id: string) => {
    if (!question) return;

    if (upvotedReplies.has(id)) {
      setUpvotedReplies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setQuestion({
        ...question,
        replies: question.replies.map((r) =>
          r.id === id ? { ...r, upvotes: r.upvotes - 1 } : r
        ),
      });
    } else {
      setUpvotedReplies((prev) => new Set(prev).add(id));
      setQuestion({
        ...question,
        replies: question.replies.map((r) =>
          r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r
        ),
      });
    }
  };

  const handlePostReply = (replyText: string) => {
    if (!question) return;

    const newReply: Reply = {
      id: `r${Date.now()}`,
      userId: 'currentUser',
      user: 'You',
      text: replyText,
      upvotes: 0,
      timestamp: 'Just now',
      image: null,
    };

    setQuestion({
      ...question,
      replies: [...question.replies, newReply],
      repliesCount: question.repliesCount + 1,
    });
  };

  if (loading) {
    return (
      <FeaturePageLayout>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
          <main className="container mx-auto px-4 max-w-5xl">
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Loading...</p>
            </div>
          </main>
        </div>
      </FeaturePageLayout>
    );
  }

  if (!question) {
    return (
      <FeaturePageLayout>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
          <main className="container mx-auto px-4 max-w-5xl">
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Question Not Found</h2>
              <p className="text-gray-600 mb-6">
                The question you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={() => router.push('/community')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Back to Community
              </button>
            </div>
          </main>
        </div>
      </FeaturePageLayout>
    );
  }

  return (
    <FeaturePageLayout>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
        <main className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => router.push('/community')}
            className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <span>←</span>
            <span>Back to Community</span>
          </button>

          {/* Thread View */}
          <ThreadView
            question={question}
            replies={question.replies}
            onUpvoteQuestion={handleUpvoteQuestion}
            onUpvoteReply={handleUpvoteReply}
            onPostReply={handlePostReply}
            upvotedQuestions={upvotedQuestions}
            upvotedReplies={upvotedReplies}
          />
        </main>
      </div>
    </FeaturePageLayout>
  );
}
