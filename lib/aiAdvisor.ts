/**
 * Krishi Sahayak - AI Advisor Library
 * 
 * Handles all Firestore operations for AI chat management and message storage.
 * Integrates with Gemini API for agricultural advice.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  getDocs,
  collectionGroup,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

/**
 * Type definitions for AI Chat
 */
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  createdAt: Date
}

export interface AIChat {
  id: string
  userId: string
  title: string
  createdAt: Date
  updatedAt?: Date
  language: 'en' | 'hi'
}

export interface AIMessageWithTimestamp extends Omit<AIMessage, 'createdAt'> {
  createdAt: Timestamp | Date
}

/**
 * System prompt for Krishi Sahayak AI
 * Comprehensive agricultural advisor context with structured response format
 */
const KRISHI_SAHAYAK_SYSTEM_PROMPT = `You are Krishi Sahayak, a friendly and knowledgeable AI agriculture advisor designed to help Indian farmers.

Your expertise includes:
- Crop disease identification and treatment
- Pest management and control
- Soil preparation and health
- Irrigation scheduling and water management
- Fertilizer recommendations (organic and chemical)
- Seed selection and planting techniques
- Harvesting best practices
- Weather-based farming advice
- Post-harvest storage and handling
- Government schemes and subsidies awareness

Your personality:
- Friendly, respectful, and empathetic
- Use simple, practical language that farmers can understand
- Be helpful like an experienced agriculture expert
- Consider Indian farming conditions and regional variations

Response Structure:
Always structure your responses as follows:
1. **Possible Problem/Issue** (समभावित समस्या): Identify and explain the issue
2. **Immediate Action** (तुरंत क्या करें): Provide step-by-step immediate actions
3. **Prevention** (बचाव): Long-term prevention and best practices

Guidelines:
- Use bullet points for clarity
- Avoid long paragraphs
- Provide specific, actionable advice
- Include both traditional and modern farming methods when relevant
- Mention approximate costs when suggesting products
- Always prioritize farmer safety and environmental sustainability

Language Rule:
CRITICAL: Always respond in the SAME language as the farmer's question.
- If the question is in Hindi → Respond completely in Hindi
- If the question is in English → Respond completely in English
- If the question is in Hinglish → Use simple Hindi or English based on context

Out-of-context handling:
If the question is NOT related to agriculture, farming, crops, livestock, irrigation, pests, fertilizers, or rural livelihoods, respond:

English: "I am Krishi Sahayak and I specialize in agriculture-related guidance. Please ask questions about farming, crops, irrigation, pests, fertilizers, or livestock."

Hindi: "मैं कृषि सहायक हूँ और मैं केवल खेती और कृषि से जुड़ी समस्याओं में मदद कर सकता हूँ। कृपया खेती, फसल, सिंचाई, कीट, उर्वरक या पशुपालन से संबंधित प्रश्न पूछें।"`

/**
 * Create a new chat in Firestore
 */
export async function createNewChat(userId: string, language: 'en' | 'hi' = 'en'): Promise<string> {
  try {
    const chatsRef = collection(db, 'ai_chats')
    const newChatRef = await addDoc(chatsRef, {
      userId,
      title: language === 'hi' ? 'नई चैट' : 'New Chat',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      language,
    })
    return newChatRef.id
  } catch (error) {
    console.error('Error creating new chat:', error)
    throw error
  }
}

/**
 * Add a message to a chat
 */
export async function addMessageToChat(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  imageUrl?: string
): Promise<string> {
  try {
    const messagesRef = collection(db, 'ai_chats', chatId, 'messages')
    const messageRef = await addDoc(messagesRef, {
      role,
      content,
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
    })

    // Update chat's updatedAt timestamp
    await updateDoc(doc(db, 'ai_chats', chatId), {
      updatedAt: serverTimestamp(),
    })

    return messageRef.id
  } catch (error) {
    console.error('Error adding message to chat:', error)
    throw error
  }
}

/**
 * Fetch all chats for a user
 */
export async function fetchUserChats(userId: string): Promise<AIChat[]> {
  try {
    const chatsRef = collection(db, 'ai_chats')
    const q = query(
      chatsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AIChat[]
  } catch (error) {
    console.error('Error fetching user chats:', error)
    throw error
  }
}

/**
 * Fetch messages from a specific chat
 */
export async function fetchChatMessages(chatId: string): Promise<AIMessage[]> {
  try {
    const messagesRef = collection(db, 'ai_chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as AIMessage[]
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    throw error
  }
}

/**
 * Subscribe to messages in a chat (real-time)
 */
export function subscribeToChat(
  chatId: string,
  onUpdate: (messages: AIMessage[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const messagesRef = collection(db, 'ai_chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          role: doc.data().role,
          content: doc.data().content,
          imageUrl: doc.data().imageUrl,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as AIMessage[]
        onUpdate(messages)
      },
      (error) => {
        console.error('Error in chat subscription:', error)
        if (onError) onError(error as Error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('Error setting up chat subscription:', error)
    throw error
  }
}

/**
 * Subscribe to user's chats (real-time)
 */
export function subscribeToChats(
  userId: string,
  onUpdate: (chats: AIChat[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const chatsRef = collection(db, 'ai_chats')
    const q = query(
      chatsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          title: doc.data().title,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || doc.data().createdAt?.toDate() || new Date(),
          language: doc.data().language || 'en',
        })) as AIChat[]
        onUpdate(chats)
      },
      (error) => {
        console.error('Error in chats subscription:', error)
        if (onError) onError(error as Error)
      }
    )

    return unsubscribe
  } catch (error) {
    console.error('Error setting up chats subscription:', error)
    throw error
  }
}

/**
 * Upload image to Firebase Storage
 */
export async function uploadImageToStorage(
  file: File,
  chatId: string,
  userId: string
): Promise<string> {
  try {
    const timestamp = Date.now()
    const fileName = `${chatId}/${userId}/${timestamp}-${file.name}`
    const storageRef = ref(storage, `ai_chat_images/${fileName}`)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadUrl = await getDownloadURL(snapshot.ref)
    return downloadUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Delete a chat and all its messages
 */
export async function deleteChat(chatId: string): Promise<void> {
  try {
    // Note: In production, consider using Cloud Functions to delete all subcollection documents
    // For now, just delete the main chat document
    await deleteDoc(doc(db, 'ai_chats', chatId))
  } catch (error) {
    console.error('Error deleting chat:', error)
    throw error
  }
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'ai_chats', chatId), {
      title,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating chat title:', error)
    throw error
  }
}

/**
 * Generate Krishi Advice using Gemini API
 * Sends the prompt to the backend API route which handles the actual Gemini call
 */
export async function generateKrishiAdvice(
  message: string,
  imageUrl?: string,
  farmerContext?: {
    location?: string
    crop?: string
    season?: string
  },
  language: 'en' | 'hi' = 'en'
): Promise<string> {
  try {
    // Build the full prompt with context if available
    let fullPrompt = message

    if (farmerContext) {
      let contextStr = ''
      if (farmerContext.location) contextStr += `Location: ${farmerContext.location}\n`
      if (farmerContext.crop) contextStr += `Crop: ${farmerContext.crop}\n`
      if (farmerContext.season) contextStr += `Season: ${farmerContext.season}\n`

      if (contextStr) {
        fullPrompt = `Farmer Context:\n${contextStr}\nQuestion:\n${message}`
      }
    }

    // If there's an image, add context about it
    if (imageUrl) {
      fullPrompt = `[Farmer uploaded an image]\n${fullPrompt}\n\nPlease analyze the image and provide diagnosis and solutions.`
    }

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        language,
        imageUrl,
        systemPrompt: KRISHI_SAHAYAK_SYSTEM_PROMPT,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Unknown error from AI API')
    }

    return data.text
  } catch (error) {
    console.error('Error generating Krishi advice:', error)
    throw error
  }
}

/**
 * Get farmer context from profile
 */
export async function getFarmerContext(userId: string): Promise<{
  location?: string
  crop?: string
  season?: string
} | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) return null

    const data = userDoc.data()
    return {
      location: data.state || data.village,
      crop: data.primaryCrop,
      season: data.season,
    }
  } catch (error) {
    console.error('Error fetching farmer context:', error)
    return null
  }
}

/**
 * Get initial greeting message based on language
 */
export function getGreetingMessage(language: 'en' | 'hi' = 'en'): string {
  if (language === 'hi') {
    return `नमस्ते! मैं कृषि सहायक हूँ 🌾\nमैं आपकी खेती से जुड़ी समस्याओं में मदद कर सकता हूँ।\nआप अपना सवाल पूछ सकते हैं।`
  }
  return `Namaste! I'm Krishi Sahayak 🌾\nI can help you with your farming problems.\nYou can ask your questions.`
}

/**
 * Detect if a message is agricultural in nature
 */
export function isAgriculturalQuestion(question: string): boolean {
  const agricultureKeywords = [
    'crop',
    'farm',
    'soil',
    'water',
    'irrigation',
    'fertilizer',
    'pest',
    'disease',
    'seed',
    'harvest',
    'wheat',
    'rice',
    'cotton',
    'sugarcane',
    'vegetable',
    'fruit',
    'kheti',
    'fasal',
    'mitti',
    'pani',
    'sinchai',
    'kheD',
    'beej',
    'keet',
    'rog',
    'rabi',
    'kharif',
    'gahnein',
  ]

  const lowerQuestion = question.toLowerCase()
  return agricultureKeywords.some((keyword) => lowerQuestion.includes(keyword))
}
