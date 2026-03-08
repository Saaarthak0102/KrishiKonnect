import { translations } from '@/lib/translations';
import {
  bazaarButtonsHindi,
  bazaarHeadingsHindi,
  cropHindiMap,
  mandiHindiMap,
  marketTrendHindi,
  priceLabelsHindi,
  stateHindiMap,
} from '@/data/krishiBazaarHindiData';

const englishToHindiDictionary: Record<string, string> = {};

function addPair(en: string, hi: string): void {
  const english = en.trim();
  const hindi = hi.trim();

  if (!english || !hindi) {
    return;
  }

  if (english === hindi) {
    return;
  }

  englishToHindiDictionary[english] = hindi;
}

function addPairsFromRecord(record: Record<string, string>): void {
  for (const [en, hi] of Object.entries(record)) {
    addPair(en, hi);
  }
}

// Seed dictionary from app-wide translations so translation helper can work across pages.
const enTranslations = translations.en as Record<string, string>;
const hiTranslations = translations.hi as Record<string, string>;

for (const key of Object.keys(enTranslations)) {
  const enValue = enTranslations[key];
  const hiValue = hiTranslations[key];

  if (typeof enValue === 'string' && typeof hiValue === 'string') {
    addPair(enValue, hiValue);
  }
}

addPairsFromRecord(cropHindiMap);
addPairsFromRecord(mandiHindiMap);
addPairsFromRecord(stateHindiMap);
addPairsFromRecord(priceLabelsHindi);
addPairsFromRecord(marketTrendHindi);
addPairsFromRecord(bazaarButtonsHindi);
addPairsFromRecord(bazaarHeadingsHindi);

// High-value community phrases for hackathon demo quality.
addPairsFromRecord({
  'Leaves turning yellow in my wheat field': 'मेरे गेहूं के खेत में पत्ते पीले हो रहे हैं',
  'Leaves turning yellow in my wheat field, what fertilizer should I apply now?':
    'मेरे गेहूं के खेत में पत्ते पीले हो रहे हैं, अब मुझे कौन सा उर्वरक डालना चाहिए?',
  'what fertilizer should I apply now': 'अब मुझे कौन सा उर्वरक डालना चाहिए',
  'When should first irrigation be done': 'पहली सिंचाई कब करनी चाहिए',
  'When should first irrigation be done after sowing wheat this season?':
    'इस मौसम में गेहूं बोने के बाद पहली सिंचाई कब करनी चाहिए?',
  'after sowing wheat this season': 'इस मौसम में गेहूं बोने के बाद',
  'Is rust disease common this year': 'क्या इस वर्ष रस्ट रोग सामान्य है',
  'Is rust disease common this year in western UP? Seeing orange powder on leaves.':
    'क्या इस वर्ष पश्चिमी यूपी में रस्ट रोग सामान्य है? पत्तियों पर नारंगी पाउडर दिखाई दे रहा है।',
  'Seeing orange powder on leaves': 'पत्तियों पर नारंगी पाउडर दिखाई दे रहा है',
  'Apply nitrogen fertilizer like urea.': 'यूरिया जैसे नाइट्रोजन उर्वरक का प्रयोग करें।',
  'No replies yet': 'अभी कोई जवाब नहीं',
  'Write a reply...': 'जवाब लिखें...',
  Send: 'भेजें',
  Reply: 'जवाब दें',
  Replies: 'उत्तर',
  Likes: 'पसंद',
});

const hindiToEnglishDictionary: Record<string, string> = Object.fromEntries(
  Object.entries(englishToHindiDictionary).map(([en, hi]) => [hi, en])
);

function translateWithDictionary(text: string, dictionary: Record<string, string>): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return text;
  }

  if (dictionary[trimmed]) {
    return dictionary[trimmed];
  }

  let translated = trimmed;
  const dictionaryEntries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);

  for (const [source, target] of dictionaryEntries) {
    translated = translated.split(source).join(target);
  }

  return translated;
}

export function translateToHindi(text: string): string {
  return translateWithDictionary(text, englishToHindiDictionary);
}

export function translateToEnglish(text: string): string {
  return translateWithDictionary(text, hindiToEnglishDictionary);
}
