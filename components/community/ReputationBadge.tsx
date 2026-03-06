'use client';

import React from 'react';

interface ReputationBadgeProps {
  reputation: number;
  showPoints?: boolean;
}

export default function ReputationBadge({ reputation, showPoints = false }: ReputationBadgeProps) {
  const getBadge = (points: number) => {
    if (points >= 2000) return { level: 'Krishi Mentor', color: 'bg-purple-600', icon: '👨‍🌾' };
    if (points >= 500) return { level: 'Expert Farmer', color: 'bg-blue-600', icon: '⭐' };
    if (points >= 100) return { level: 'Helpful Farmer', color: 'bg-green-600', icon: '🌟' };
    return { level: 'Farmer', color: 'bg-gray-600', icon: '🌱' };
  };

  const badge = getBadge(reputation);

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5`}>
        <span>{badge.icon}</span>
        <span>{badge.level}</span>
      </span>
      {showPoints && (
        <span className="text-sm text-gray-600 font-medium">
          {reputation} pts
        </span>
      )}
    </div>
  );
}
