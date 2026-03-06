'use client';

import React from 'react';
import ReputationBadge from './ReputationBadge';

interface CommunityStatsProps {
  reputation: number;
  answersPosted: number;
  upvotesReceived: number;
}

export default function CommunityStats({
  reputation,
  answersPosted,
  upvotesReceived,
}: CommunityStatsProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🏆 Community Reputation
      </h3>

      <div className="mb-4">
        <ReputationBadge reputation={reputation} showPoints />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Answers Posted:</span>
          <span className="font-semibold text-gray-800">{answersPosted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Upvotes Received:</span>
          <span className="font-semibold text-gray-800">{upvotesReceived}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Keep helping other farmers to increase your reputation!
        </p>
      </div>
    </div>
  );
}
