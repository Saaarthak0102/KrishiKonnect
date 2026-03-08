import { NextRequest, NextResponse } from 'next/server'
import { detectLanguage, toResponseLanguage } from '@/lib/languageDetector'
import { buildFarmContext } from '@/lib/buildFarmContext'

interface AIRequestBody {
  userQuestion?: string
  userId?: string
  location?: string
  crop?: string
  language?: 'en' | 'hi'
  prompt?: string
}

interface AIResponseBody {
  reply: string
}

const GEMINI_MODELS = ['gemini-pro', 'gemini-2.0-flash', 'gemini-2.5-flash']

const FALLBACK_REPLY =
  'The AI Advisor is currently unavailable. Please try again later or ask your question in the community forum.'

// Common crop names for fallback detection
const COMMON_CROPS = [
  // English names
  'wheat',
  'rice',
  'maize',
  'corn',
  'banana',
  'mango',
  'sugarcane',
  'cotton',
  'potato',
  'tomato',
  'onion',
  'garlic',
  'carrot',
  'cabbage',
  'lettuce',
  'spinach',
  'broccoli',
  'cauliflower',
  'peas',
  'beans',
  'lentil',
  'chickpea',
  'barley',
  'oats',
  'rye',
  'sorghum',
  'millets',
  'mustard',
  'rapeseed',
  'sesame',
  'groundnut',
  'coconut',
  'palm',
  'tea',
  'coffee',
  'cocoa',
  'spices',
  'chili',
  'cumin',
  'coriander',
  'turmeric',
  'ginger',
  'eggplant',
  'cucumber',
  'squash',
  'melon',
  'watermelon',
  'papaya',
  'guava',
  'apple',
  'grapes',
  'citrus',
  'orange',
  'lemon',
  'lime',
  'strawberry',
  'blueberry',
  'raspberry',
  'brinjal',
  'okra',
  'turnip',
  'radish',
  'beet',
  // Hinglish (Roman script Hindi)
  'gehun',
  'gehu',
  'chawal',
  'makka',
  'kela',
  'aam',
  'ganna',
  'kapas',
  'aloo',
  'tamatar',
  'pyaz',
  'lahsun',
  'gajar',
  'gobhi',
  'patta gobhi',
  'pulak',
  'broccoli',
  'gobi',
  'baigan',
  'khire',
  'kaddu',
  'kharbuza',
  'tarbooz',
  'papita',
  'amrud',
  'seba',
  'angoor',
  'santra',
  'nimbu',
  'khatte nimbu',
  'dal',
  'masoor',
  'arhar',
  'moong',
  'urad',
  'chana',
  'urad dal',
  'moong dal',
  'matar',
  'rajma',
  'sem',
  'sarso',
  'tel',
  'tilhan',
  'mungfali',
  'mungphali',
  'til',
  'gul',
  'chai',
  'kopi',
  'kakao',
  'masala',
  'mirch',
  'jeera',
  'dhania',
  'dhaniya',
  'haldi',
  'adrak',
  'sukha adrak',
  'bath',
  'bjra',
  'jowar',
  'bajri',
  'barley',
  'jau',
  'oat',
  'rai',
  'kharif',
  'rabi',
  'fasal',
  'fasl',
  'kheti',
  'kheth',
  'farming',
  'farm',
  'crop',
  // Hindi Devanagari names
  'गेहूं',
  'गेहु',
  'चावल',
  'मक्का',
  'केला',
  'आम',
  'गन्ना',
  'कपास',
  'आलू',
  'टमाटर',
  'प्याज',
  'लहसुन',
  'गाजर',
  'पत्तागोभी',
  'पालक',
  'ब्रोकली',
  'फूलगोभी',
  'मिर्च',
  'बैंगन',
  'खीरा',
  'कद्दू',
  'खरबूजा',
  'तरबूज',
  'पपीता',
  'अमरूद',
  'सेब',
  'अंगूर',
  'संतरा',
  'नींबू',
  'दाल',
  'मसूर',
  'अरहर',
  'मूंग',
  'उड़द',
  'चना',
  'मटर',
  'राजमा',
  'सेम',
  'सरसों',
  'तेल',
  'तिल',
  'मूंगफली',
  'नारियल',
  'चाय',
  'कॉफी',
  'कोको',
  'मसाला',
  'जीरा',
  'धनिया',
  'हल्दी',
  'अदरक',
  'हरड़',
  'ज्वार',
  'बाजरा',
  'जौ',
  'राई',
  'खरीफ',
  'रबी',
  'फसल',
  'खेती',
  'सिंचाई',
  'मिट्टी',
  'मंडी',
  'कीट',
  'रोग',
  'बीमारी',
  'दवा',
  'खाद',
  'उर्वरक',
  'बीज',
]

/**
 * Check if question contains any crop names (fast local check)
 */
function containsCropName(question: string): boolean {
  const lowerQuestion = question.toLowerCase()
  return COMMON_CROPS.some((crop) => lowerQuestion.includes(crop))
}

function getCropAliases(crop: string): string[] {
  const normalized = crop.toLowerCase().trim()
  const aliasMap: Record<string, string[]> = {
    maize: ['maize', 'corn', 'makka', 'मक्का'],
    wheat: ['wheat', 'gehun', 'gehu', 'गेहूं', 'गेहु'],
    rice: ['rice', 'paddy', 'chawal', 'धान', 'चावल'],
    cotton: ['cotton', 'kapas', 'कपास'],
    sugarcane: ['sugarcane', 'ganna', 'गन्ना'],
    potato: ['potato', 'aloo', 'आलू'],
    tomato: ['tomato', 'tamatar', 'टमाटर'],
    onion: ['onion', 'pyaz', 'प्याज'],
    banana: ['banana', 'kela', 'केला'],
    mango: ['mango', 'aam', 'आम'],
  }

  const fallback = normalized
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  return Array.from(new Set([normalized, ...(aliasMap[normalized] || []), ...fallback]))
}

function questionMentionsPrimaryCrop(question: string, primaryCrop: string): boolean {
  const lowerQuestion = question.toLowerCase()
  const aliases = getCropAliases(primaryCrop)
  return aliases.some((alias) => lowerQuestion.includes(alias.toLowerCase()))
}

function extractMentionedCrop(question: string): string | null {
  const lowerQuestion = question.toLowerCase()
  const sortedByLength = [...COMMON_CROPS].sort((a, b) => b.length - a.length)
  const match = sortedByLength.find((crop) => lowerQuestion.includes(crop.toLowerCase()))
  return match || null
}

function shouldIncludePrimaryCropContext(question: string, primaryCrop: string): boolean {
  if (!primaryCrop.trim()) return false

  const mentionsAnyCrop = containsCropName(question)
  if (!mentionsAnyCrop) {
    // Generic questions benefit from user profile context.
    return true
  }

  return questionMentionsPrimaryCrop(question, primaryCrop)
}

/**
 * Use Gemini to classify if a question is farming-related
 * Returns true if farming-related, false otherwise
 */
async function classifyQuestionWithGemini(
  question: string,
  apiKey: string
): Promise<boolean> {
  const classificationPrompt = `You are Krishi Sahayak, an agriculture advisor for Indian farmers.

First determine if the following question is related to farming, agriculture, crops, irrigation, soil, weather, fertilizers, pests, mandi prices, or farm management.

If it is farming related respond with:
FARMING: YES

If it is unrelated respond with:
FARMING: NO

Question:
${question}`

  try {
    const requestBody = {
      contents: [
        {
          parts: [{ text: classificationPrompt }],
        },
      ],
    }

    for (const model of GEMINI_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        if (response.status === 404) {
          continue
        }
        continue
      }

      const data = await response.json()
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (typeof responseText === 'string' && responseText.includes('FARMING: YES')) {
        return true
      }

      if (typeof responseText === 'string' && responseText.includes('FARMING: NO')) {
        return false
      }
    }

    // If classification fails, return false to be safe
    return false
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AI Advisor] Classification API error:', error)
    }
    // Default to false if classification fails
    return false
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<AIResponseBody>> {
  try {
    let body: AIRequestBody

    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 200 })
    }

    const userQuestion =
      typeof body.userQuestion === 'string' && body.userQuestion.trim()
        ? body.userQuestion.trim()
        : typeof body.prompt === 'string'
          ? body.prompt.trim()
          : ''

    const userId = typeof body.userId === 'string' && body.userId.trim() ? body.userId.trim() : 'demo-user'
    const location = typeof body.location === 'string' ? body.location.trim() : ''
    const crop = typeof body.crop === 'string' ? body.crop.trim() : ''
    if (!userQuestion) {
      return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 200 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AI Advisor] GEMINI_API_KEY is missing in environment variables.')
      }
      return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 200 })
    }

    const detectedLanguage = detectLanguage(userQuestion)

    const responseLanguage = toResponseLanguage(detectedLanguage)

    // Step 1: Check if question contains a crop name (fast local check)
    const hasCropName = containsCropName(userQuestion)

    // Step 2: If no crop name, use AI classification
    let isFarmingRelated = hasCropName
    if (!hasCropName) {
      isFarmingRelated = await classifyQuestionWithGemini(userQuestion, geminiApiKey)
    }

    // Step 3: If not farming-related, return out-of-scope message
    if (!isFarmingRelated) {
      const outOfScopeReply =
        responseLanguage === 'hindi'
          ? '⚠️ कृषि सहायक केवल खेती से जुड़े सवालों का जवाब देता है।\n\nकृपया निम्न विषयों के बारे में पूछें:\n• फसलें और बीज\n• कीटों और बीमारियों का इलाज\n• सिंचाई और जल प्रबंधन\n• उर्वरक और खाद\n• मौसम और फसल की योजना\n• मंडी के भाव'
          : responseLanguage === 'hinglish'
            ? '⚠️ Krishi Sahayak sirf farming-related sawalon ka jawab deta hai.\n\nKripya in vishayon ke barein me puchhen:\n• Fasal aur beej\n• Keet aur bimari ka ilaj\n• Sinchai aur jal prabandhan\n• Khad aur khad\n• Mausam aur fasal ki yojana\n• Mandi ke bhav'
            : '⚠️ Krishi Sahayak only answers farming-related questions.\n\nPlease ask about:\n• Crops and seeds\n• Pest and disease treatment\n• Irrigation and water management\n• Fertilizers and manure\n• Weather and crop planning\n• Mandi prices'

      return NextResponse.json({ reply: outOfScopeReply }, { status: 200 })
    }

    const farmContext = await buildFarmContext(userId)

    const context = {
      ...farmContext,
      location: location || farmContext.location,
      crop: crop || farmContext.crop,
      mandi: {
        ...farmContext.mandi,
        crop: crop || farmContext.mandi.crop,
      },
    }

    const prompt = buildFarmerPrompt({
      context,
      question: userQuestion,
      responseLanguage,
    })

    try {
      const reply = await callGeminiAPI(prompt, geminiApiKey)
      return NextResponse.json({ reply }, { status: 200 })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AI Advisor] Gemini API error:', error)
      }
      return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 200 })
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AI Advisor] Unexpected route error:', error)
    }
    return NextResponse.json({ reply: FALLBACK_REPLY }, { status: 200 })
  }
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  }

  let lastError: Error | null = null

  for (const model of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      const error = new Error(
        `Gemini model ${model} responded with status ${response.status}: ${errorText}`
      )

      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[AI Advisor] Gemini API non-200 response (${response.status}) for model ${model}:`,
          errorText
        )
      }

      lastError = error

      // If model is unavailable, try the next model.
      if (response.status === 404) {
        continue
      }

      continue
    }

    const data = await response.json()
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (typeof candidateText === 'string' && candidateText.trim()) {
      return candidateText
    }

    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[AI Advisor] Gemini parsing failed for model ${model}. Raw response:`,
        data
      )
    }

    lastError = new Error(`Gemini model ${model} returned an invalid response payload`)
  }

  if (process.env.NODE_ENV === 'development' && lastError) {
    console.error('[AI Advisor] All Gemini model attempts failed:', lastError)
  }

  return FALLBACK_REPLY
}

function buildFarmerPrompt({
  context,
  question,
  responseLanguage,
}: {
  context: {
    location: string
    crop: string
    season: string
    cropStage: string
    weather: {
      temperature: string
      humidity: string
      condition: string
    }
    mandi: {
      crop: string
      price: string
      market: string
    }
  }
  question: string
  responseLanguage: 'english' | 'hindi' | 'hinglish'
}): string {
  const responseLanguageLabel =
    responseLanguage === 'hindi'
      ? 'Hindi'
      : responseLanguage === 'hinglish'
        ? 'Hinglish (Hindi written in English letters)'
        : 'English'

  const includePrimaryCropContext = shouldIncludePrimaryCropContext(question, context.crop)
  const mentionedCrop = extractMentionedCrop(question)

  const contextualSections = [
    `📍 Location: ${context.location}`,
    `🌤️ Current weather: ${context.weather.temperature}, ${context.weather.condition}, Humidity ${context.weather.humidity}`,
  ]

  if (includePrimaryCropContext) {
    contextualSections.push(
      `🌾 Primary crop: ${context.crop}`,
      `📅 Season: ${context.season}`,
      `🌱 Crop stage: ${context.cropStage}`,
      `💰 Market price for ${context.mandi.crop}: ${context.mandi.price}`,
      `🏪 Market: ${context.mandi.market}`
    )
  } else if (context.crop) {
    contextualSections.push(
      `🌾 Primary crop: ${context.crop} (use only if the question is about ${context.crop} or farmer's own current crop)`
    )
  }

  const cropFocusLine = mentionedCrop
    ? `Question mentions crop: ${mentionedCrop}`
    : includePrimaryCropContext
      ? `Question mentions crop: not explicit (use profile crop context if needed)`
      : 'Question mentions crop: not explicit'

  return `You are Krishi Sahayak, an AI agriculture advisor for Indian farmers.

Language Rule:
Respond strictly in ${responseLanguageLabel}.
If responseLanguage = Hindi, use Devanagari script.
If responseLanguage = Hinglish, write Hindi words using English letters.
Use very simple farmer-friendly language.
Do not switch to full English for Hinglish responses.

Critical Relevance Rule:
If farmer asks about a specific crop, answer for that crop.
Do NOT switch the answer to the user's primary crop unless the question is about that crop.
Use profile crop/mandi/crop-stage context only when it is relevant.

Use the farmer's environment to give personalized advice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Farmer Context:
${contextualSections.join('\n')}

${cropFocusLine}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instructions:
• Give practical farming advice
• Keep answers simple and farmer-friendly
• Use bullet points for clarity
• Always consider location and weather
• Consider crop stage and mandi price only when relevant to the asked crop
• Avoid generic chatbot answers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Response Format (REQUIRED):

Follow this exact structure:

1) Quick Answer
[Direct answer to the farmer's question]

2) Recommended Action
• [Specific action 1]
• [Specific action 2]
• [Specific action 3]

3) Weather Impact
[How current weather affects this situation]

4) Market Insight
[Relevant mandi price information if applicable, otherwise skip this section]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Farmer Question:
${question}

Provide your answer following the exact format above.`
}
