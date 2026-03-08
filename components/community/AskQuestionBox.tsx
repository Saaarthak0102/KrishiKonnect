'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { communityHindiLabels } from '@/data/communityHindiLabels';

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
    <>
      <style>{`
        textarea::placeholder,
        select option:disabled {
          color: rgba(45,42,110,0.55);
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45, ease: 'easeOut' }}
        className="rounded-[16px] p-[20px_22px] transition-all duration-[250ms] ease-out"
        style={{
          background: 'linear-gradient(rgba(46,157,87,0.05), rgba(196,106,61,0.03)), rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(196,106,61,0.25)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.08), 0 0 12px rgba(45,42,110,0.05)',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.10), 0 0 12px rgba(196,106,61,0.08)';
          e.currentTarget.style.borderColor = 'rgba(196,106,61,0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.08), 0 0 12px rgba(45,42,110,0.05)';
          e.currentTarget.style.borderColor = 'rgba(196,106,61,0.25)';
        }}
      >
      <div className="flex flex-col gap-3">
        {/* Crop Selector */}
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full px-4 py-2.5 rounded-[10px] focus:outline-none text-[0.95rem] font-medium"
          style={{
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(196,106,61,0.35)',
            color: '#2D2A6E',
            transition: 'all 0.2s ease-out',
          }}
          onFocus={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderColor = 'rgba(196,106,61,0.45)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(196,106,61,0.35)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
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
          placeholder={lang === 'hi' ? communityHindiLabels.postPlaceholder : t('questionsPlaceholder')}
          className="w-full px-4 py-3 rounded-[10px] focus:outline-none resize-none text-[0.95rem]"
          style={{
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(196,106,61,0.35)',
            color: '#2D2A6E',
            transition: 'all 0.2s ease-out',
          }}
          rows={3}
          maxLength={500}
          onFocus={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderColor = 'rgba(196,106,61,0.45)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(196,106,61,0.35)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        />

        <div className="flex justify-end">
          <motion.button
            onClick={handleAskQuestion}
            disabled={!questionText.trim() || !selectedCrop || isPosting}
            className="px-6 py-2.5 rounded-[10px] font-medium text-white"
            style={{
              background: !questionText.trim() || !selectedCrop || isPosting ? '#D1D5DB' : '#2D2A6E',
              cursor: !questionText.trim() || !selectedCrop || isPosting ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s ease-out',
            }}
            whileHover={!questionText.trim() || !selectedCrop || isPosting ? {} : {
              y: -2,
              scale: 1.03,
              boxShadow: '0 10px 22px rgba(45,42,110,0.20), 0 0 10px rgba(45,42,110,0.12)',
              transition: { duration: 0.25, ease: 'easeOut' },
            }}
            whileTap={!questionText.trim() || !selectedCrop || isPosting ? {} : {
              scale: 0.98,
              transition: { duration: 0.15, ease: 'easeOut' },
            }}
          >
            {isPosting ? 'Posting...' : t('postToGlobalFeed')}
          </motion.button>
        </div>
      </div>
    </motion.div>
    </>
  );
}
