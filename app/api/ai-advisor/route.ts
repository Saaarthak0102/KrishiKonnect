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

const FARMING_KEYWORDS = [
  'crop',
  'farm',
  'farming',
  'farmer',
  'soil',
  'irrigation',
  'water',
  'rain',
  'fertilizer',
  'manure',
  'pest',
  'disease',
  'seed',
  'harvest',
  'mandi',
  'price',
  'weather',
  'wheat',
  'rice',
  'maize',
  'cotton',
  'mustard',
  'vegetable',
  'kheti',
  'fasal',
  'beej',
  'mitti',
  'sinchai',
  'mausam',
  'urvarak',
  'bimari',
  'rog',
  'kisan',
  'mandi bhav',
  'खेत',
  'खेती',
  'फसल',
  'बीज',
  'मंडी',
  'मौसम',
  'सिंचाई',
  'उर्वरक',
  'किसान',
]

function isLikelyFarmingQuestion(question: string): boolean {
  const lowerQuestion = question.toLowerCase()
  return FARMING_KEYWORDS.some((keyword) => lowerQuestion.includes(keyword))
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
    const userToggleLanguage: 'en' | 'hi' = body.language === 'hi' ? 'hi' : 'en'

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

    // Priority rule: Hindi toggle forces Hindi response regardless of input.
    const responseLanguage =
      userToggleLanguage === 'hi' ? 'hindi' : toResponseLanguage(detectedLanguage)

    if (!isLikelyFarmingQuestion(userQuestion)) {
      const outOfScopeReply =
        responseLanguage === 'hindi'
          ? 'कृषि सहायक मुख्य रूप से खेती से जुड़े सवालों में मदद करता है। कृपया फसल, कीट, सिंचाई, उर्वरक, मौसम या मंडी भाव से जुड़ा प्रश्न पूछें।'
          : 'Krishi Sahayak focuses on farming advice. Please ask about crops, pests, irrigation, fertilizer, weather, or mandi prices.'

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
  responseLanguage: 'english' | 'hindi'
}): string {
  return `You are Krishi Sahayak, an AI agriculture advisor for Indian farmers.

Use the farmer's environment to give personalized advice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Farmer Context:

📍 Location: ${context.location}
🌾 Crop: ${context.crop}
📅 Season: ${context.season}
🌱 Crop Stage: ${context.cropStage}

Weather:
🌤️ Temperature: ${context.weather.temperature}
💧 Humidity: ${context.weather.humidity}
☁️ Condition: ${context.weather.condition}

Market Data:
💰 Current mandi price for ${context.crop}: ${context.mandi.price}
🏪 Market: ${context.mandi.market}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instructions:
• Give practical farming advice
• Keep answers simple and farmer-friendly
• Use bullet points for clarity
• Always consider weather, crop stage, and location
• Avoid generic chatbot answers
• Respond strictly in ${responseLanguage}

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
