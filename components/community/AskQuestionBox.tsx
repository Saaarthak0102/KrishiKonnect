'use client';

import React, { useState } from 'react';

interface AskQuestionBoxProps {
  onSubmit: (question: {
    questionText: string;
    description: string;
    cropTag: string;
    cropEmoji: string;
    image: string | null;
  }) => void;
}

const CROPS = [
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Wheat', emoji: '🌾' },
  { name: 'Rice', emoji: '🌾' },
  { name: 'Potato', emoji: '🥔' },
  { name: 'Onion', emoji: '🧅' },
  { name: 'Maize', emoji: '🌽' },
  { name: 'Cotton', emoji: '🌱' },
  { name: 'Sugarcane', emoji: '🌾' },
  { name: 'Chilli', emoji: '🌶️' },
];

export default function AskQuestionBox({ onSubmit }: AskQuestionBoxProps) {
  const [questionText, setQuestionText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedCropEmoji, setSelectedCropEmoji] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (!questionText.trim() || !selectedCrop || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      questionText: questionText.trim(),
      description: description.trim(),
      cropTag: selectedCrop,
      cropEmoji: selectedCropEmoji,
      image: null,
    });

    // Reset form
    setQuestionText('');
    setDescription('');
    setSelectedCrop('');
    setSelectedCropEmoji('');
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          💬 Ask the Community
        </h2>
        <p className="text-sm text-gray-600">Share your farming questions and get help from experienced farmers</p>
      </div>

      <div className="space-y-4">
        {/* Question Title */}
        <div>
          <input
            type="text"
            placeholder="Ask the community a question..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-base transition-colors"
          />
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <>
            {/* Description */}
            <div>
              <textarea
                placeholder="Provide more details about your question..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-base resize-none transition-colors"
              />
            </div>

            {/* Crop Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Select Crop:</label>
              <select
                value={selectedCrop}
                onChange={(e) => {
                  const crop = CROPS.find(c => c.name === e.target.value);
                  setSelectedCrop(e.target.value);
                  setSelectedCropEmoji(crop?.emoji || '');
                }}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-base"
              >
                <option value="">Choose crop...</option>
                {CROPS.map((crop) => (
                  <option key={crop.name} value={crop.name}>
                    {crop.emoji} {crop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Post Question
              </button>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setQuestionText('');
                  setDescription('');
                  setSelectedCrop('');
                  setSelectedCropEmoji('');
                }}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ml-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                📷 Add Photo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
