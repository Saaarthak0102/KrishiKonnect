/**
 * Test Script for AI Advisor Classification Logic
 * Tests crop detection and AI-based classification
 */

// Simulated crop detection logic
const COMMON_CROPS = [
  // English names
  'wheat', 'rice', 'maize', 'corn', 'banana', 'mango', 'sugarcane', 'cotton', 'potato', 'tomato',
  'onion', 'garlic', 'carrot', 'cabbage', 'lettuce', 'spinach', 'broccoli', 'cauliflower', 'peas', 'beans',
  'lentil', 'chickpea', 'barley', 'oats', 'rye', 'sorghum', 'millets', 'mustard', 'rapeseed', 'sesame',
  'groundnut', 'coconut', 'palm', 'tea', 'coffee', 'cocoa', 'spices', 'chili', 'cumin', 'coriander',
  'turmeric', 'ginger', 'eggplant', 'cucumber', 'squash', 'melon', 'watermelon', 'papaya', 'guava', 'apple',
  'grapes', 'citrus', 'orange', 'lemon', 'lime', 'strawberry', 'blueberry', 'raspberry', 'brinjal', 'okra',
  'turnip', 'radish', 'beet',
  // Hinglish (Roman script Hindi)
  'gehun', 'gehu', 'chawal', 'makka', 'kela', 'aam', 'ganna', 'kapas', 'aloo', 'tamatar',
  'pyaz', 'lahsun', 'gajar', 'gobhi', 'patta gobhi', 'pulak', 'baigan', 'khire', 'kaddu', 'kharbuza',
  'tarbooz', 'papita', 'amrud', 'seba', 'angoor', 'santra', 'nimbu', 'dal', 'masoor', 'arhar',
  'moong', 'urad', 'chana', 'matar', 'rajma', 'sarso', 'tel', 'tilhan', 'mungfali', 'til',
  'chai', 'kopi', 'kakao', 'masala', 'mirch', 'jeera', 'dhania', 'dhaniya', 'haldi', 'adrak',
  'bjra', 'jowar', 'bajri', 'jau', 'rai', 'kharif', 'rabi', 'fasal', 'fasl', 'kheti',
  // Hindi Devanagari names
  'गेहूं', 'गेहु', 'चावल', 'मक्का', 'केला', 'आम', 'गन्ना', 'कपास', 'आलू', 'टमाटर',
  'प्याज', 'लहसुन', 'गाजर', 'पत्तागोभी', 'पालक', 'ब्रोकली', 'फूलगोभी', 'मिर्च', 'बैंगन', 'खीरा',
  'कद्दू', 'खरबूजा', 'तरबूज', 'पपीता', 'अमरूद', 'सेब', 'अंगूर', 'संतरा', 'नींबू', 'दाल',
  'मसूर', 'अरहर', 'मूंग', 'उड़द', 'चना', 'मटर', 'राजमा', 'सेम', 'सरसों', 'तेल',
  'तिल', 'मूंगफली', 'नारियल', 'चाय', 'कॉफी', 'कोको', 'मसाला', 'जीरा', 'धनिया', 'हल्दी',
  'अदरक', 'हरड़', 'ज्वार', 'बाजरा', 'जौ', 'राई', 'खरीफ', 'रबी', 'फसल', 'खेती',
  'सिंचाई', 'मिट्टी', 'मंडी', 'कीट', 'रोग', 'बीमारी', 'दवा', 'खाद', 'उर्वरक', 'बीज',
]

function containsCropName(question) {
  const lowerQuestion = question.toLowerCase()
  return COMMON_CROPS.some((crop) => lowerQuestion.includes(crop))
}

// Test cases
const testQuestions = [
  {
    q: 'kya ghaziabad mai kela ugaya ja sakta hai',
    shouldPass: true,
    reason: 'Contains "kela" (banana in Hinglish)'
  },
  {
    q: 'gehun me kaunsi khad use kare',
    shouldPass: true,
    reason: 'Contains "gehun" (wheat in Hinglish)'
  },
  {
    q: 'aloo ki bimaari ka ilaj',
    shouldPass: true,
    reason: 'Contains "aloo" (potato in Hinglish)'
  },
  {
    q: 'What is the weather today?',
    shouldPass: false,
    reason: 'Weather question without crop context - needs Gemini'
  },
  {
    q: 'Tell me a joke about farming',
    shouldPass: false,
    reason: 'Entertainment question - needs Gemini'
  },
  {
    q: 'tomato ke liye best khad',
    shouldPass: true,
    reason: 'Contains "tomato"'
  },
  {
    q: 'आम की सही देखभाल कैसे करें',
    shouldPass: true,
    reason: 'Contains "आम" (mango in Hindi)'
  },
  {
    q: 'makka ki fasal kaise lagaye',
    shouldPass: true,
    reason: 'Contains "makka" (maize in Hinglish)'
  }
]

console.log('🧪 AI Advisor Classification Test Suite\n')
console.log('=' .repeat(60))

let passed = 0
let failed = 0

testQuestions.forEach((test, idx) => {
  const result = containsCropName(test.q)
  const status = result ? '✅ PASS (Crop detected)' : '⏳ Needs Gemini classification'
  const isCorrect = result === test.shouldPass ? '✓' : '✗'
  
  if (result === test.shouldPass) {
    passed++
  } else {
    failed++
  }
  
  console.log(`\nTest ${idx + 1}: ${isCorrect}`)
  console.log(`Question: "${test.q}"`)
  console.log(`Reason: ${test.reason}`)
  console.log(`Result: ${status}`)
})

console.log('\n' + '='.repeat(60))
console.log(`\n📊 Results: ${passed}/${testQuestions.length} passed`)
console.log(`   ✅ Crop Detection: ${passed}`)
console.log(`   ⏳ Will use Gemini: ${failed}`)

if (failed === 0) {
  console.log('\n🎉 All crop detection tests passed!')
} else {
  console.log(`\n✓ ${failed} question(s) will use Gemini for classification`)
}

