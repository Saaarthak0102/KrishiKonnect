'use client';

import React, { useState } from 'react';
import ReplyCard from './ReplyCard';

interface Reply {
  id: string;
  userId: string;
  user: string;
  text: string;
  upvotes: number;
  timestamp: string;
  image?: string | null;
}

interface ThreadViewProps {
  question: {
    id: string;
    crop: string;
    cropEmoji: string;
    question: string;
    description: string;
    user: string;
    userId: string;
    upvotes: number;
    timestamp: string;
    image?: string | null;
  };
  replies: Reply[];
  onUpvoteQuestion: (id: string) => void;
  onUpvoteReply: (id: string) => void;
  onPostReply: (replyText: string) => void;
  upvotedQuestions?: Set<string>;
  upvotedReplies?: Set<string>;
}

export default function ThreadView({
  question,
  replies,
  onUpvoteQuestion,
  onUpvoteReply,
  onPostReply,
  upvotedQuestions = new Set(),
  upvotedReplies = new Set(),
}: ThreadViewProps) {
  const [replyText, setReplyText] = useState('');

  const handlePostReply = () => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    onPostReply(replyText.trim());
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Question Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        {/* Crop Tag */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
            <span className="text-xl">{question.cropEmoji}</span>
            <span>{question.crop}</span>
          </span>
        </div>

        {/* Question Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          {question.question}
        </h1>

        {/* Description */}
        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
          {question.description}
        </p>

        {/* Image if present */}
        {question.image && (
          <div className="mb-6">
            <img 
              src={question.image} 
              alt="Question image" 
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* User Info */}
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">👤 {question.user}</span>
            <span className="text-gray-400">•</span>
            <span>{question.timestamp}</span>
          </div>

          {/* Upvote Button */}
          <button
            onClick={() => onUpvoteQuestion(question.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              upvotedQuestions.has(question.id)
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>⬆️</span>
            <span>{question.upvotes} Upvotes</span>
          </button>
        </div>
      </div>

      {/* Replies Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          💬 {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {/* Replies List */}
        <div className="space-y-4 mb-6">
          {replies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No replies yet. Be the first to help!
            </p>
          ) : (
            replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                id={reply.id}
                user={reply.user}
                text={reply.text}
                upvotes={reply.upvotes}
                timestamp={reply.timestamp}
                image={reply.image}
                onUpvote={onUpvoteReply}
                isUpvoted={upvotedReplies.has(reply.id)}
              />
            ))
          )}
        </div>

        {/* Reply Input */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Your Answer
          </h3>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Share your knowledge and help a fellow farmer..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-base resize-none mb-4"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handlePostReply}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Post Reply
            </button>
            <button
              type="button"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              📷 Add Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
