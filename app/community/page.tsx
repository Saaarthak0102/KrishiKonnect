'use client';

import { useState, useEffect } from 'react';
import FeaturePageLayout from '@/components/FeaturePageLayout';
import AskQuestionBox from '@/components/community/AskQuestionBox';
import FilterBar, { FilterType } from '@/components/community/FilterBar';
import QuestionCard from '@/components/community/QuestionCard';
import { useStarredCrops } from '@/lib/useStarredCrops';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToQuestions,
  addCommunityQuestion,
  upvoteQuestion,
  removeUpvoteQuestion,
  CommunityQuestion,
  QuestionInput,
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
  const [upvotedQuestions, setUpvotedQuestions] = useState<Set<string>>(new Set());
  const { starredCrops } = useStarredCrops();
  const { user } = useAuth();
  const [isPosting, setIsPosting] = useState(false);

  // Real-time subscription to questions
  useEffect(() => {
    const unsubscribe = subscribeToQuestions((firestoreQuestions) => {
      const convertedQuestions = firestoreQuestions.map(convertQuestion);
      setQuestions(convertedQuestions);
    }, 50); // Load more questions for better experience

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

  const handleAskQuestion = (newQuestion: {
    questionText: string;
    description: string;
    cropTag: string;
    cropEmoji: string;
    image: string | null;
  }) => {
    const question: Question = {
      id: String(Date.now()),
      crop: newQuestion.cropTag,
      cropEmoji: newQuestion.cropEmoji,
      question: newQuestion.questionText,
      description: newQuestion.description,
      user: 'You',
      userId: 'currentUser',
      upvotes: 0,
      repliesCount: 0,
      timestamp: 'Just now',
      image: newQuestion.image,
      hasImage: !!newQuestion.image,
      replies: [],
    };

    setQuestions([question, ...questions]);
  };

  const handleUpvote = (id: string) => {
    if (upvotedQuestions.has(id)) {
      // Remove upvote
      setUpvotedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes - 1 } : q))
      );
    } else {
      // Add upvote
      setUpvotedQuestions((prev) => new Set(prev).add(id));
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
      );
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
          <AskQuestionBox onSubmit={handleAskQuestion} />

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
                  isUpvoted={upvotedQuestions.has(question.id)}
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
