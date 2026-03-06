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
  imageUrl?: string
  systemPrompt?: string
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
 *   "language": "en" or "hi",
 *   "imageUrl": "optional image URL for crop analysis",
 *   "systemPrompt": "optional custom system prompt"
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

    const { prompt, language = 'en', imageUrl, systemPrompt } = body

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
    
    // Debug log to verify API key is loaded
    console.log('Gemini API Key Loaded:', !!geminiApiKey)

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not configured in environment variables.')
      console.warn('Using fallback response instead of Gemini API.')
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
      console.log('Calling Gemini API with prompt length:', prompt.length)
      const response = await callGeminiAPI(
        prompt,
        geminiApiKey,
        language,
        imageUrl,
        systemPrompt
      )
      console.log('Gemini API response received successfully')
      return NextResponse.json(
        {
          success: true,
          text: response,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Gemini API error:', error)
      console.error('Full error details:', error instanceof Error ? error.message : String(error))
      
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
 * Supports text and image inputs for crop analysis
 */
async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  language: 'en' | 'hi',
  imageUrl?: string,
  systemPrompt?: string
): Promise<string> {
  // Use Gemini 1.5 model for better multimodal support
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

  // Build the request content with text and optionally image
  const parts: any[] = []

  // Add image if provided
  if (imageUrl) {
    try {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
      }

      const buffer = await imageResponse.arrayBuffer()
      const base64Image = Buffer.from(buffer).toString('base64')
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'

      parts.push({
        inlineData: {
          mimeType,
          data: base64Image,
        },
      })
    } catch (error) {
      console.warn('Could not process image, continuing with text only:', error)
    }
  }

  // Add text prompt - create comprehensive agricultural context
  const enhancedSystemPrompt = systemPrompt || buildDefaultSystemPrompt(language)
  const fullPrompt = `${enhancedSystemPrompt}\n\nUser Question:\n${prompt}`

  parts.push({
    text: fullPrompt,
  })

  const requestBody = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  }

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    // Log the full error response for debugging
    const errorText = await response.text()
    console.error(
      `Gemini API responded with status ${response.status}:`,
      errorText
    )
    throw new Error(
      `Gemini API responded with status ${response.status}: ${errorText}`
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
 * Builds a comprehensive default system prompt for agricultural advice
 */
function buildDefaultSystemPrompt(language: 'en' | 'hi'): string {
  if (language === 'hi') {
    return `आप कृषि सहायक हैं, भारतीय किसानों के लिए एक AI कृषि सलाहकार।

आपकी भूमिका:
- फसल रोगों और कीटों की पहचान करना
- मिट्टी की तैयारी में मदद करना
- सिंचाई की सलाह देना
- उर्वरक की सिफारिश करना
- कटाई के टिप्स देना
- व्यावहारिक कृषि मार्गदर्शन प्रदान करना

हमेशा निम्नलिखित प्रारूप में उत्तर दें:
1. **संभावित समस्या**: समस्या की पहचान
2. **तुरंत क्या करें**: तत्काल कार्रवाई
3. **बचाव**: भविष्य में रोकथाम के उपाय

सरल भाषा का उपयोग करें और किसान के अनुकूल बनें। बुलेट पॉइंट्स का उपयोग करें।`
  }

  return `You are Krishi Sahayak, an AI agricultural advisor for Indian farmers.

Your role:
- Help farmers identify crop diseases and pests
- Provide advice on soil preparation
- Give irrigation recommendations
- Suggest fertilizer applications
- Offer pest control solutions
- Share harvesting tips
- Provide practical agricultural guidance

Always structure your responses as follows:
1. **Possible Problem/Issue**: Identify the issue
2. **Immediate Action**: What to do right now
3. **Prevention**: How to prevent this in the future

Keep the language simple and farmer-friendly. Use bullet points and avoid long paragraphs.

IMPORTANT: Always respond in the SAME language as the farmer's question.`
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
