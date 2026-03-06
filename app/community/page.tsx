'use client';

import { useState, useEffect } from 'react';
import FeaturePageLayout from '@/components/FeaturePageLayout';
import AskQuestionBox from '@/components/community/AskQuestionBox';
import FilterBar, { FilterType } from '@/components/community/FilterBar';
import QuestionCard from '@/components/community/QuestionCard';
import { useStarredCrops } from '@/lib/useStarredCrops';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToFeedCache,
  addCommunityQuestion,
  upvoteQuestion,
  removeUpvoteQuestion,
  CommunityQuestion,
} from '@/lib/community';
import { Timestamp } from 'firebase/firestore';

interface Question {
  id: string;
  crop: string;
  cropEmoji: string;
  question: string;
  description: string;
  user: string;
  userId: string;
  upvotes: number;
  upvotedBy: string[];
  repliesCount: number;
  timestamp: string;
  image?: string | null;
  hasImage?: boolean;
  replies?: any[];
}

// Helper function to format timestamp
function formatTimestamp(timestamp: Timestamp | null): string {
  if (!timestamp || !timestamp.toDate) return 'Just now';
  
  const date = timestamp.toDate();
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

// Convert Firestore question to UI format
function convertQuestion(q: CommunityQuestion): Question {
  return {
    id: q.id,
    crop: q.cropTag,
    cropEmoji: q.cropEmoji,
    question: q.questionText,
    description: q.description,
    user: q.userName,
    userId: q.userId,
    upvotes: q.upvotes,
    upvotedBy: q.upvotedBy || [],
    repliesCount: q.repliesCount,
    timestamp: formatTimestamp(q.createdAt),
    image: q.imageUrl,
    hasImage: !!q.imageUrl,
  };
}

export default function CommunityPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const { starredCrops } = useStarredCrops();
  const { user } = useAuth();
  const [isPosting, setIsPosting] = useState(false);

  // Real-time subscription to cached feed (1 document read instead of 20+)
  useEffect(() => {
    const unsubscribe = subscribeToFeedCache((cachedQuestions) => {
      const convertedQuestions = cachedQuestions.map(convertQuestion);
      setQuestions(convertedQuestions);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...questions];

    switch (activeFilter) {
      case 'myCrops':
        filtered = filtered.filter((q) => starredCrops.includes(q.crop));
        break;
      case 'unanswered':
        filtered = filtered.filter((q) => q.repliesCount === 0);
        break;
      case 'mostUpvoted':
        filtered = filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'recent':
        // Already sorted by recent in mock data
        break;
      case 'all':
      default:
        break;
    }

    setFilteredQuestions(filtered);
  }, [activeFilter, questions, starredCrops]);

  const handleAskQuestion = async (newQuestion: {
    questionText: string;
    description: string;
    cropTag: string;
    cropEmoji: string;
    image: string | null;
  }) => {
    if (!user) {
      alert('Please sign in to post a question');
      return;
    }

    setIsPosting(true);

    try {
      // Optimistic UI update - add question immediately
      const optimisticQuestion: Question = {
        id: 'temp-' + Date.now(),
        crop: newQuestion.cropTag,
        cropEmoji: newQuestion.cropEmoji,
        question: newQuestion.questionText,
        description: newQuestion.description,
        user: user.displayName || 'You',
        userId: user.uid,
        upvotes: 0,
        upvotedBy: [],
        repliesCount: 0,
        timestamp: 'Just now',
        image: newQuestion.image,
        hasImage: !!newQuestion.image,
      };

      setQuestions([optimisticQuestion, ...questions]);

      // Add to Firestore (real-time listener will update with actual data)
      await addCommunityQuestion(
        user.uid,
        user.displayName || 'Anonymous',
        '🌱', // Default badge
        {
          questionText: newQuestion.questionText,
          description: newQuestion.description,
          cropTag: newQuestion.cropTag,
          cropEmoji: newQuestion.cropEmoji,
          imageUrl: newQuestion.image,
        }
      );

      // Remove optimistic update (real data will come from listener)
      setQuestions((prev) => prev.filter((q) => q.id !== optimisticQuestion.id));
    } catch (error) {
      console.error('Error posting question:', error);
      alert('Failed to post question. Please try again.');
      // Remove optimistic update on error
      setQuestions((prev) => prev.filter((q) => !q.id.startsWith('temp-')));
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (!user) {
      alert('Please sign in to upvote');
      return;
    }

    try {
      const selectedQuestion = questions.find((q) => q.id === id);
      const isUpvoted = !!selectedQuestion && selectedQuestion.upvotedBy.includes(user.uid);

      if (isUpvoted) {
        // Optimistic update
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  upvotes: q.upvotes - 1,
                  upvotedBy: q.upvotedBy.filter((upvoterId) => upvoterId !== user.uid),
                }
              : q
          )
        );

        // Update Firestore
        await removeUpvoteQuestion(id, user.uid);
      } else {
        // Optimistic update
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  upvotes: q.upvotes + 1,
                  upvotedBy: q.upvotedBy.includes(user.uid)
                    ? q.upvotedBy
                    : [...q.upvotedBy, user.uid],
                }
              : q
          )
        );

        // Update Firestore
        await upvoteQuestion(id, user.uid);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
      // Revert optimistic update on error
      const selectedQuestion = questions.find((q) => q.id === id);
      const isUpvoted = !!selectedQuestion && selectedQuestion.upvotedBy.includes(user.uid);

      if (isUpvoted) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  upvotes: q.upvotes + 1,
                  upvotedBy: q.upvotedBy.includes(user.uid)
                    ? q.upvotedBy
                    : [...q.upvotedBy, user.uid],
                }
              : q
          )
        );
      } else {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  upvotes: q.upvotes - 1,
                  upvotedBy: q.upvotedBy.filter((upvoterId) => upvoterId !== user.uid),
                }
              : q
          )
        );
      }
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <FeaturePageLayout>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
        <main className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🌾 Community Discussions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ask questions, share farming tips, and help fellow farmers
            </p>
          </div>

          {/* Ask Question Box */}
          <AskQuestionBox onSubmit={handleAskQuestion} isPosting={isPosting} />

          {/* Filter Bar */}
          <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

          {/* Questions Feed */}
          <div className="space-y-4 mb-6">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {activeFilter === 'myCrops'
                    ? '⭐ No questions about your starred crops yet. Try asking one!'
                    : activeFilter === 'unanswered'
                    ? '❓ All questions have been answered!'
                    : '📋 No questions yet. Be the first to ask!'}
                </p>
              </div>
            ) : (
              filteredQuestions.slice(0, visibleCount).map((question) => (
                <QuestionCard
                  key={question.id}
                  id={question.id}
                  crop={question.crop}
                  cropEmoji={question.cropEmoji}
                  question={question.question}
                  description={question.description}
                  user={question.user}
                  timestamp={question.timestamp}
                  upvotes={question.upvotes}
                  repliesCount={question.repliesCount}
                  image={question.image}
                  onUpvote={handleUpvote}
                  isUpvoted={!!user && question.upvotedBy.includes(user.uid)}
                />
              ))
            )}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredQuestions.length && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Load More Questions
              </button>
            </div>
          )}
        </main>
      </div>
    </FeaturePageLayout>
  );
}
