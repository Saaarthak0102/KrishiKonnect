/**
 * AI Advisor API Route
 * 
 * This is a server-side only route that handles AI/Gemini API calls.
 * It ensures that the Gemini API key is never exposed to the client.
 * 
 * All AI requests from the client must go through this route.
 */

import { NextRequest, NextResponse } from 'next/server'

interface AIRequestBody {
  prompt: string
  language?: 'en' | 'hi'
}

interface AIResponseBody {
  success: boolean
  text?: string
  error?: string
}

/**
 * POST /api/ai
 * 
 * Handles AI advisor requests.
 * 
 * Request body:
 * {
 *   "prompt": "Your farming question here",
 *   "language": "en" or "hi"
 * }
 * 
 * Response:
 * {
 *   "success": true/false,
 *   "text": "AI response text",
 *   "error": "error message if failed"
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse<AIResponseBody>> {
  try {
    // Parse request body
    let body: AIRequestBody
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body. Expected JSON with "prompt" field.' 
        },
        { status: 400 }
      )
    }

    const { prompt, language = 'en' } = body

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt is required and must be a non-empty string.' 
        },
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      console.warn('GEMINI_API_KEY is not configured. Using fallback response.')
      return NextResponse.json(
        {
          success: true,
          text: getGracefulFallbackResponse(prompt, language),
        },
        { status: 200 }
      )
    }

    // Call Gemini API
    try {
      const response = await callGeminiAPI(prompt, geminiApiKey, language)
      return NextResponse.json(
        {
          success: true,
          text: response,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Gemini API error:', error)
      
      // Fall back to canned response if Gemini fails
      console.warn('Gemini API call failed. Using fallback response.')
      return NextResponse.json(
        {
          success: true,
          text: getGracefulFallbackResponse(prompt, language),
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in AI route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

/**
 * Calls the Google Gemini API with the provided prompt
 */
async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  language: 'en' | 'hi'
): Promise<string> {
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

  // Add language context to the prompt
  const enhancedPrompt = language === 'hi' 
    ? `You are an agricultural expert helping Indian farmers. Respond in Hindi (Devanagari script). ${prompt}`
    : `You are an agricultural expert helping farmers. ${prompt}`

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: enhancedPrompt,
          },
        ],
      },
    ],
  }

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Gemini API responded with status ${response.status}: ${JSON.stringify(errorData)}`
    )
  }

  const data = await response.json()

  // Extract text from Gemini response
  if (
    data.candidates &&
    data.candidates.length > 0 &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts.length > 0
  ) {
    return data.candidates[0].content.parts[0].text
  }

  throw new Error('Invalid response format from Gemini API')
}

/**
 * Returns a graceful fallback response when Gemini API is unavailable
 * This ensures the app continues to function even without the API key
 */
function getGracefulFallbackResponse(prompt: string, language: 'en' | 'hi'): string {
  if (language === 'hi') {
    return `आपके सवाल के लिए धन्यवाद: "${prompt}"\n\nअभी AI सलाहकार उपलब्ध नहीं है। कृपया बाद में फिर से कोशिश करें या हमारे समुदाय फोरम में अपना सवाल पूछें।\n\nसुझाव:\n1. स्थानीय कृषि विभाग से संपर्क करें\n2. अन्य किसानों से अनुभव साझा करें\n3. सरकारी कृषि वेबसाइटें देखें`
  }

  return `Thank you for your question: "${prompt}"\n\nThe AI Advisor is not currently available. Please try again later or ask your question in our community forum.\n\nSuggestions:\n1. Contact your local agriculture department\n2. Share experiences with other farmers\n3. Check government agriculture websites`
}
