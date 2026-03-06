'use client';

import React from 'react';
import Link from 'next/link';

interface QuestionCardProps {
  id: string;
  crop: string;
  cropEmoji: string;
  question: string;
  description: string;
  user: string;
  timestamp: string;
  upvotes: number;
  repliesCount: number;
  image?: string | null;
  onUpvote: (id: string) => void;
  isUpvoted?: boolean;
}

export default function QuestionCard({
  id,
  crop,
  cropEmoji,
  question,
  description,
  user,
  timestamp,
  upvotes,
  repliesCount,
  image,
  onUpvote,
  isUpvoted = false,
}: QuestionCardProps) {
  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUpvote(id);
  };

  return (
    <Link href={`/community/${id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer border border-green-100 hover:border-green-300">
        {/* Crop Tag */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium text-sm">
            <span>{cropEmoji}</span>
            <span>{crop}</span>
          </span>
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {question}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Image if present */}
        {image && (
          <div className="mb-4">
            <img 
              src={image} 
              alt="Question image" 
              className="w-full max-h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-green-100">
          {/* User Info */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-medium">👤 {user}</span>
            <span className="text-gray-400">•</span>
            <span>{timestamp}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpvoteClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isUpvoted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>⬆️</span>
              <span>{upvotes}</span>
            </button>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <span>💬</span>
              <span>{repliesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
