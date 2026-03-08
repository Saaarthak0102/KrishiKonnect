/**
 * AI Translation Utility for Krishi Sahayak
 * 
 * Translates AI responses between English and Hindi using Gemini API
 */

import { translateToHindi, translateToEnglish } from './translateText'

export type BilingualText = {
  en: string
  hi: string
}

/**
 * Translate text using Gemini API for high-quality agricultural translations
 */
async function translateWithGemini(text: string, targetLang: 'en' | 'hi'): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!apiKey) {
    console.warn('Gemini API key not found, using fallback translation')
    return targetLang === 'hi' ? translateToHindi(text) : translateToEnglish(text)
  }

  try {
    const prompt = targetLang === 'hi'
      ? `Translate the following agricultural advice text to Hindi. Keep technical terms accurate and farmer-friendly:\n\n${text}`
      : `Translate the following agricultural advice text to English. Keep technical terms accurate:\n\n${text}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Translation API failed')
    }

    const data = await response.json()
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!translated) {
      throw new Error('No translation returned')
    }

    return translated.trim()
  } catch (error) {
    console.error('Gemini translation failed:', error)
    // Fallback to dictionary-based translation
    return targetLang === 'hi' ? translateToHindi(text) : translateToEnglish(text)
  }
}

/**
 * Convert a text to bilingual format (both English and Hindi)
 * Detects source language and translates to the other
 */
export async function createBilingualText(text: string): Promise<BilingualText> {
  // Simple language detection - check if text contains Devanagari characters
  const hasHindi = /[\u0900-\u097F]/.test(text)

  if (hasHindi) {
    // Source is Hindi, translate to English
    const englishText = await translateWithGemini(text, 'en')
    return {
      en: englishText,
      hi: text,
    }
  } else {
    // Source is English, translate to Hindi
    const hindiText = await translateWithGemini(text, 'hi')
    return {
      en: text,
      hi: hindiText,
    }
  }
}

/**
 * Get text in specific language from bilingual text
 */
export function getBilingualText(
  bilingualText: BilingualText | string,
  language: 'en' | 'hi'
): string {
  if (typeof bilingualText === 'string') {
    // Legacy support - return as is
    return bilingualText
  }
  return bilingualText[language]
}

/**
 * Client-side translation utility (uses dictionary-based fallback)
 */
export function translateClientSide(text: string, targetLang: 'en' | 'hi'): string {
  return targetLang === 'hi' ? translateToHindi(text) : translateToEnglish(text)
}
