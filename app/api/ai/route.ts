import { NextRequest, NextResponse } from 'next/server'

interface AIRequestBody {
  userQuestion?: string
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

    const location = typeof body.location === 'string' ? body.location.trim() : ''
    const crop = typeof body.crop === 'string' ? body.crop.trim() : ''
    const language: 'en' | 'hi' = body.language === 'hi' ? 'hi' : 'en'

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

    const prompt = buildFarmerPrompt({
      location,
      crop,
      userQuestion,
      language,
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

      // If model is unavailable, try next model; otherwise continue and let fallback handle.
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
  location,
  crop,
  userQuestion,
  language,
}: {
  location?: string
  crop?: string
  userQuestion: string
  language: 'en' | 'hi'
}): string {
  if (language === 'hi') {
    return `Farmer Context:
Location: ${location || 'अज्ञात'}
Crop: ${crop || 'अज्ञात'}

Question:
${userQuestion}

Instructions for the AI:
Give practical agricultural advice suitable for Indian farmers.
Include:
- Soil requirements
- Best planting season
- Fertilizer advice
- Irrigation guidance
- Pest or disease prevention if relevant

Keep the answer simple, clear, and actionable.
Respond in Hindi.`
  }

  return `Farmer Context:
Location: ${location || 'Unknown'}
Crop: ${crop || 'Unknown'}

Question:
${userQuestion}

Instructions for the AI:
Give practical agricultural advice suitable for Indian farmers.
Include:
- Soil requirements
- Best planting season
- Fertilizer advice
- Irrigation guidance
- Pest or disease prevention if relevant

Keep the answer simple, clear, and actionable.`
}
