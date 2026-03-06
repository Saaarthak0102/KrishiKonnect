'use client';

import React from 'react';

interface ReplyCardProps {
  id: string;
  user: string;
  text: string;
  upvotes: number;
  timestamp: string;
  image?: string | null;
  onUpvote: (id: string) => void;
  isUpvoted?: boolean;
}

export default function ReplyCard({
  id,
  user,
  text,
  upvotes,
  timestamp,
  image,
  onUpvote,
  isUpvoted = false,
}: ReplyCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-medium text-gray-800">👤 {user}</span>
        <span className="text-gray-400">•</span>
        <span className="text-sm text-gray-600">{timestamp}</span>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{text}</p>

      {image && (
        <div className="mb-4">
          <img
            src={image}
            alt="Reply image"
            className="w-full max-h-64 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="flex items-center">
        <button
          onClick={() => onUpvote(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isUpvoted
              ? 'bg-green-100 text-green-700'
              : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
          }`}
        >
          <span>⬆️</span>
          <span>{upvotes}</span>
        </button>
      </div>
    </div>
  );
}
