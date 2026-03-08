const englishToHindiDictionary: Record<string, string> = {
  'Leaves turning yellow in my wheat field': 'मेरे गेहूं के खेत में पत्ते पीले हो रहे हैं',
  'what fertilizer should I apply now': 'अब मुझे कौन सा उर्वरक डालना चाहिए',
  'When should first irrigation be done': 'पहली सिंचाई कब करनी चाहिए',
  'after sowing wheat this season': 'इस मौसम में गेहूं बोने के बाद',
  'Is rust disease common this year': 'क्या इस वर्ष रस्ट रोग सामान्य है',
  'Seeing orange powder on leaves': 'पत्तियों पर नारंगी पाउडर दिखाई दे रहा है',

  'Leaves turning yellow in my wheat field, what fertilizer should I apply now?': 'मेरे गेहूं के खेत में पत्ते पीले हो रहे हैं, अब मुझे कौन सा उर्वरक डालना चाहिए?',
  'When should first irrigation be done after sowing wheat this season?': 'इस मौसम में गेहूं बोने के बाद पहली सिंचाई कब करनी चाहिए?',
  'Is rust disease common this year in western UP? Seeing orange powder on leaves.': 'क्या इस वर्ष पश्चिमी यूपी में रस्ट रोग सामान्य है? पत्तियों पर नारंगी पाउडर दिखाई दे रहा है।',
  'Apply nitrogen fertilizer like urea.': 'यूरिया जैसे नाइट्रोजन उर्वरक का प्रयोग करें।',
};

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
    if (!source) {
      continue;
    }

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
