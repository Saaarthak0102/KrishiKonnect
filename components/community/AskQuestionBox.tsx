'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface AskQuestionBoxProps {
  onPostCreated?: (
    content: string,
    cropTagEn: string,
    cropTagHi: string,
    cropEmoji: string
  ) => Promise<void> | void;
}

const CROP_OPTIONS = [
  { en: 'Wheat', hi: 'गेहूँ', emoji: '🌾' },
  { en: 'Rice', hi: 'धान', emoji: '🌾' },
  { en: 'Vegetables', hi: 'सब्जियाँ', emoji: '🥬' },
  { en: 'Fruits', hi: 'फल', emoji: '🍎' },
  { en: 'Irrigation', hi: 'सिंचाई', emoji: '💧' },
  { en: 'Pest Control', hi: 'कीट नियंत्रण', emoji: '🐛' },
];

export default function AskQuestionBox({ onPostCreated }: AskQuestionBoxProps) {
  const { t, lang } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleAskQuestion = async () => {
    if (!questionText.trim()) {
      alert(t('pleaseEnterQuestion'));
      return;
    }

    if (!selectedCrop) {
      alert(t('pleaseSelectCrop'));
      return;
    }

    const selectedCropData = CROP_OPTIONS.find((crop) => crop.en === selectedCrop);

    if (!selectedCropData) {
      alert(t('pleaseSelectCrop'));
      return;
    }

    try {
      setIsPosting(true);

      if (onPostCreated) {
        await onPostCreated(
          questionText.trim(),
          selectedCropData.en,
          selectedCropData.hi,
          selectedCropData.emoji
        );
      }

      // Clear input fields only after successful post.
      setQuestionText('');
      setSelectedCrop('');

      alert(t('questionPostedSuccessfully'));
    } catch (error) {
      console.error('Error posting question:', error);
      alert('Failed to post question. Please try again.');
    } finally {
      setIsPosting(false);
    }
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
          <option value="">{t('selectCategory')}</option>
          {CROP_OPTIONS.map((crop) => (
            <option key={crop.en} value={crop.en}>
              {crop.emoji} {lang === 'en' ? crop.en : crop.hi}
            </option>
          ))}
        </select>

        {/* Question Input */}
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={t('questionsPlaceholder')}
          className="w-full px-4 py-3 border border-krishi-border rounded-md focus:outline-none focus:ring-2 focus:ring-krishi-primary focus:border-krishi-primary resize-none"
          rows={3}
          maxLength={500}
        />

        <div className="flex justify-end">
          <button
            onClick={handleAskQuestion}
            disabled={!questionText.trim() || !selectedCrop || isPosting}
            className="px-6 py-2.5 bg-krishi-primary text-white rounded-md font-medium hover:bg-krishi-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isPosting ? 'Posting...' : t('postToGlobalFeed')}
          </button>
        </div>
      </div>
    </div>
  );
}
