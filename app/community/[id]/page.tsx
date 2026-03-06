'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FeaturePageLayout from '@/components/FeaturePageLayout';
import ThreadView from '@/components/community/ThreadView';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  subscribeToReplies,
  addReply,
  upvoteQuestion,
  removeUpvoteQuestion,
  upvoteReply,
  removeUpvoteReply,
  CommunityReply,
} from '@/lib/community';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Reply {
  id: string;
  userId: string;
  user: string;
  text: string;
  upvotes: number;
  upvotedBy: string[];
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
  location: string;
  upvotes: number;
  upvotedBy: string[];
  repliesCount: number;
  timestamp: string;
  image?: string | null;
  hasImage?: boolean;
  replies: Reply[];
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Timestamp | Date | null): string {
  if (!timestamp) return 'Just now';

  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Convert Firestore reply to UI format
function convertReply(r: CommunityReply): Reply {
  return {
    id: r.id,
    userId: r.userId,
    user: r.userName,
    text: r.replyText,
    upvotes: r.upvotes,
    upvotedBy: r.upvotedBy || [],
    timestamp: formatTimestamp(r.createdAt as Date | Timestamp | null),
    image: r.imageUrl,
  };
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;
  const { user } = useAuth();
  const { t } = useTranslation();

  const [question, setQuestion] = useState<Question | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load question from Firestore
  useEffect(() => {
    async function loadQuestion() {
      try {
        const questionRef = doc(db, 'community_questions', questionId);
        const questionDoc = await getDoc(questionRef);

        if (questionDoc.exists()) {
          const data = questionDoc.data();
          setQuestion({
            id: questionDoc.id,
            crop: data.cropTag,
            cropEmoji: data.cropEmoji,
            question: data.questionText,
            description: data.description,
            user: data.userName,
            userId: data.userId,
            location: data.userLocation || 'Unknown Location',
            upvotes: data.upvotes || 0,
            upvotedBy: data.upvotedBy || [],
            repliesCount: data.repliesCount || 0,
            timestamp: formatTimestamp(data.createdAt as Date | Timestamp | null),
            image: data.imageUrl,
            hasImage: !!data.imageUrl,
            replies: [],
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading question:', error);
        setLoading(false);
      }
    }

    loadQuestion();
  }, [questionId]);

  // Real-time subscription to replies
  useEffect(() => {
    const unsubscribe = subscribeToReplies(questionId, (firestoreReplies) => {
      const convertedReplies = firestoreReplies.map(convertReply);
      setReplies(convertedReplies);
      
      // Update replies count in question
      if (question) {
        setQuestion({
          ...question,
          repliesCount: convertedReplies.length,
        });
      }
    });

    return () => unsubscribe();
  }, [questionId]);

  const handleUpvoteQuestion = async (id: string) => {
    if (!user) {
      alert(t('pleaseSignInToUpvote') || 'Please sign in to upvote');
      return;
    }

    if (!question) return;

    try {
      const isUpvoted = question.upvotedBy.includes(user.uid);

      if (isUpvoted) {
        // Optimistic update
        setQuestion({
          ...question,
          upvotes: question.upvotes - 1,
          upvotedBy: question.upvotedBy.filter((upvoterId) => upvoterId !== user.uid),
        });

        // Update Firestore
        await removeUpvoteQuestion(id, user.uid);
      } else {
        // Optimistic update
        setQuestion({
          ...question,
          upvotes: question.upvotes + 1,
          upvotedBy: question.upvotedBy.includes(user.uid)
            ? question.upvotedBy
            : [...question.upvotedBy, user.uid],
        });

        // Update Firestore
        await upvoteQuestion(id, user.uid);
      }
    } catch (error) {
      console.error('Error upvoting question:', error);
      // Revert on error
      const isUpvoted = question.upvotedBy.includes(user.uid);
      if (isUpvoted) {
        setQuestion({
          ...question,
          upvotes: question.upvotes + 1,
          upvotedBy: question.upvotedBy.includes(user.uid)
            ? question.upvotedBy
            : [...question.upvotedBy, user.uid],
        });
      } else {
        setQuestion({
          ...question,
          upvotes: question.upvotes - 1,
          upvotedBy: question.upvotedBy.filter((upvoterId) => upvoterId !== user.uid),
        });
      }
    }
  };

  const handleUpvoteReply = async (id: string) => {
    if (!user) {
      alert(t('pleaseSignInToUpvote') || 'Please sign in to upvote');
      return;
    }

    if (!question) return;

    try {
      const selectedReply = replies.find((reply) => reply.id === id);
      const isUpvoted = !!selectedReply && selectedReply.upvotedBy.includes(user.uid);

      if (isUpvoted) {
        // Optimistic update
        setReplies((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  upvotes: r.upvotes - 1,
                  upvotedBy: r.upvotedBy.filter((upvoterId) => upvoterId !== user.uid),
                }
              : r
          )
        );

        // Update Firestore
        await removeUpvoteReply(questionId, id, user.uid);
      } else {
        // Optimistic update
        setReplies((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  upvotes: r.upvotes + 1,
                  upvotedBy: r.upvotedBy.includes(user.uid)
                    ? r.upvotedBy
                    : [...r.upvotedBy, user.uid],
                }
              : r
          )
        );

        // Update Firestore
        await upvoteReply(questionId, id, user.uid);
      }
    } catch (error) {
      console.error('Error upvoting reply:', error);
      // Revert on error
      const selectedReply = replies.find((reply) => reply.id === id);
      const isUpvoted = !!selectedReply && selectedReply.upvotedBy.includes(user.uid);

      if (isUpvoted) {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  upvotes: r.upvotes + 1,
                  upvotedBy: r.upvotedBy.includes(user.uid)
                    ? r.upvotedBy
                    : [...r.upvotedBy, user.uid],
                }
              : r
          )
        );
      } else {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  upvotes: r.upvotes - 1,
                  upvotedBy: r.upvotedBy.filter((upvoterId) => upvoterId !== user.uid),
                }
              : r
          )
        );
      }
    }
  };

  const handlePostReply = async (replyText: string) => {
    if (!user) {
      alert(t('pleaseSignInToReply') || 'Please sign in to post a reply');
      return;
    }

    if (!question) return;

    setIsPosting(true);

    try {
      // Optimistic UI update
      const optimisticReply: Reply = {
        id: 'temp-' + Date.now(),
        userId: user.uid,
        user: user.displayName || 'You',
        text: replyText,
        upvotes: 0,
        upvotedBy: [],
        timestamp: 'Just now',
        image: null,
      };

      setReplies([...replies, optimisticReply]);

      // Add to Firestore (real-time listener will update with actual data)
      await addReply(questionId, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userLocation: question.location || 'Unknown',
        replyText,
      });

      // Remove optimistic update (real data will come from listener)
      setReplies((prev) => prev.filter((r) => r.id !== optimisticReply.id));
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(t('failedToPostReply') || 'Failed to post reply. Please try again.');
      // Remove optimistic update on error
      setReplies((prev) => prev.filter((r) => !r.id.startsWith('temp-')));
    } finally {
      setIsPosting(false);
    }
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('questionNotFound') || 'Question Not Found'}</h2>
              <p className="text-gray-600 mb-6">
                {t('questionNotFoundDesc') || "The question you're looking for doesn't exist or has been removed."}
              </p>
              <button
                onClick={() => router.push('/community')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                {t('backToCommunity') || 'Back to Krishi Sangh'}
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
            <span>{t('backToCommunity') || 'Back to Krishi Sangh'}</span>
          </button>

          {/* Thread View */}
          <ThreadView
            question={question}
            replies={replies}
            onUpvoteQuestion={handleUpvoteQuestion}
            onUpvoteReply={handleUpvoteReply}
            onPostReply={handlePostReply}
            isQuestionUpvoted={!!user && question.upvotedBy.includes(user.uid)}
            upvotedReplyIds={
              !!user
                ? new Set(
                    replies
                      .filter((reply) => reply.upvotedBy.includes(user.uid))
                      .map((reply) => reply.id)
                  )
                : new Set<string>()
            }
            isPosting={isPosting}
          />
        </main>
      </div>
    </FeaturePageLayout>
  );
}
