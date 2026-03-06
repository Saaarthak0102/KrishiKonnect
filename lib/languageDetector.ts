export type DetectedLanguage = 'english' | 'hindi' | 'hinglish'
export type ResponseLanguage = 'english' | 'hindi' | 'hinglish'

const HINDI_REGEX = /[\u0900-\u097F]/

const HINGLISH_HINT_WORDS = [
  'kaise',
  'kya',
  'kyu',
  'kyon',
  'kab',
  'kaun',
  'kahan',
  'aam',
  'gehun',
  'gehu',
  'kheti',
  'beej',
  'fasal',
  'pani',
  'sinchai',
  'mitti',
  'rog',
  'keet',
  'upay',
]

export function detectLanguage(text: string): DetectedLanguage {
  if (!text || typeof text !== 'string') {
    return 'english'
  }

  if (HINDI_REGEX.test(text)) {
    return 'hindi'
  }

  const lowerText = text.toLowerCase()
  const isHinglish = HINGLISH_HINT_WORDS.some((word) =>
    lowerText.includes(word)
  )

  if (isHinglish) {
    return 'hinglish'
  }

  return 'english'
}

export function toResponseLanguage(language: DetectedLanguage): ResponseLanguage {
  if (language === 'hindi') {
    return 'hindi'
  }

  if (language === 'hinglish') {
    return 'hinglish'
  }

  return 'english'
}
