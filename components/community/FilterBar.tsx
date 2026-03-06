'use client';

import React from 'react';

export type FilterType = 'all' | 'myCrops' | 'unanswered' | 'mostUpvoted' | 'recent';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'myCrops', label: 'My Crops', icon: '⭐' },
    { id: 'unanswered', label: 'Unanswered', icon: '❓' },
    { id: 'mostUpvoted', label: 'Most Upvoted', icon: '⬆️' },
    { id: 'recent', label: 'Recent', icon: '🕒' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1.5">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
