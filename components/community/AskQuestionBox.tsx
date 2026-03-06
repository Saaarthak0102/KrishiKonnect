'use client';

import { useState } from 'react';

interface AskQuestionBoxProps {
  onPostCreated?: (content: string, cropTag: string) => void;
}

export default function AskQuestionBox({ onPostCreated }: AskQuestionBoxProps) {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [questionText, setQuestionText] = useState('');

  const handleAskQuestion = () => {
    if (!questionText.trim()) {
      alert('Please enter a question.');
      return;
    }

    if (!selectedCrop) {
      alert('Please select a crop category.');
      return;
    }

    // Call the callback to add to global feed
    if (onPostCreated) {
      onPostCreated(questionText.trim(), selectedCrop);
    }

    // Clear input fields
    setQuestionText('');
    setSelectedCrop('');

    alert('Question posted successfully!');
  };

  return (
    <div className="bg-white border-2 border-krishi-border rounded-xl shadow-sm p-4">
      <div className="flex flex-col gap-3">
        {/* Crop Selector */}
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full px-4 py-2.5 border border-krishi-border rounded-md focus:outline-none focus:ring-2 focus:ring-krishi-primary focus:border-krishi-primary bg-white"
        >
          <option value="">Select Category...</option>
          <option value="Wheat">🌾 Wheat</option>
          <option value="Rice">🌾 Rice</option>
          <option value="Vegetables">🥬 Vegetables</option>
          <option value="Fruits">🍎 Fruits</option>
          <option value="Irrigation">💧 Irrigation</option>
          <option value="Pest Control">🐛 Pest Control</option>
        </select>

        {/* Question Input */}
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Ask farmers about crop problems..."
          className="w-full px-4 py-3 border border-krishi-border rounded-md focus:outline-none focus:ring-2 focus:ring-krishi-primary focus:border-krishi-primary resize-none"
          rows={3}
          maxLength={500}
        />

        <div className="flex justify-end">
          <button
            onClick={handleAskQuestion}
            disabled={!questionText.trim() || !selectedCrop}
            className="px-6 py-2.5 bg-krishi-primary text-white rounded-md font-medium hover:bg-krishi-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Post to Global Feed
          </button>
        </div>
      </div>
    </div>
  );
}
