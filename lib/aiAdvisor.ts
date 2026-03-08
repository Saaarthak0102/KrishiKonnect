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
  limit,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

/**
 * Bilingual text content
 */
export interface BilingualContent {
  en: string
  hi: string
}

/**
 * Type definitions for AI Chat
 */
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string // Legacy field for backward compatibility
  bilingualContent?: BilingualContent // New bilingual content
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
  crop?: string
  lastMessage?: string
}

export interface AIMessageWithTimestamp extends Omit<AIMessage, 'createdAt'> {
  createdAt: Timestamp | Date
}

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
  imageUrl?: string,
  bilingualContent?: BilingualContent
): Promise<string> {
  try {
    const messagesRef = collection(db, 'ai_chats', chatId, 'messages')
    const messageData: any = {
      role,
      content,
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
    }

    // Add bilingual content if provided
    if (bilingualContent) {
      messageData.bilingualContent = bilingualContent
    }

    const messageRef = await addDoc(messagesRef, messageData)

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
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            role: data.role,
            content: data.content,
            bilingualContent: data.bilingualContent,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
          }
        }) as AIMessage[]
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
          crop: doc.data().crop,
          lastMessage: doc.data().lastMessage,
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
 * Subscribe to latest chat for a user and include first user question preview.
 */
export function subscribeToLatestAIChat(
  userId: string,
  onUpdate: (chat: AIChat | null, firstQuestion: string | null) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId) {
    onUpdate(null, null)
    return () => {}
  }

  const chatsRef = collection(db, 'ai_chats')
  const latestChatQuery = query(
    chatsRef,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(1)
  )

  let unsubscribeMessages: (() => void) | null = null

  const unsubscribeChats = onSnapshot(
    latestChatQuery,
    (snapshot) => {
      if (unsubscribeMessages) {
        unsubscribeMessages()
        unsubscribeMessages = null
      }

      if (snapshot.empty) {
        onUpdate(null, null)
        return
      }

      const latestDoc = snapshot.docs[0]
      const chatData = latestDoc.data()

      const latestChat: AIChat = {
        id: latestDoc.id,
        userId: chatData.userId,
        title: chatData.title || '',
        createdAt: chatData.createdAt?.toDate() || new Date(),
        updatedAt: chatData.updatedAt?.toDate() || chatData.createdAt?.toDate() || new Date(),
        language: chatData.language || 'en',
        crop: chatData.crop,
        lastMessage: chatData.lastMessage,
      }

      const messagesRef = collection(db, 'ai_chats', latestDoc.id, 'messages')
      const firstQuestionQuery = query(
        messagesRef,
        where('role', '==', 'user'),
        orderBy('createdAt', 'asc'),
        limit(1)
      )

      unsubscribeMessages = onSnapshot(
        firstQuestionQuery,
        (messagesSnapshot) => {
          const firstQuestion = messagesSnapshot.empty
            ? null
            : (messagesSnapshot.docs[0].data().content as string) || null

          onUpdate(latestChat, firstQuestion)
        },
        (error) => {
          if (onError) onError(error as Error)
          onUpdate(latestChat, null)
        }
      )
    },
    (error) => {
      if (onError) onError(error as Error)
    }
  )

  return () => {
    unsubscribeChats()
    if (unsubscribeMessages) {
      unsubscribeMessages()
    }
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
  userId: string,
  imageUrl?: string,
  farmerContext?: {
    location?: string
    crop?: string
    season?: string
  },
  language: 'en' | 'hi' = 'en'
): Promise<string> {
  try {
    const userQuestion = imageUrl
      ? `[Farmer uploaded an image]
${message}

Please include image-based diagnosis or observations if relevant.`
      : message

    const response = await fetch('/api/ai-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userQuestion,
        userId,
        location: farmerContext?.location,
        crop: farmerContext?.crop,
        language,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    const reply = typeof data?.reply === 'string' ? data.reply : typeof data?.text === 'string' ? data.text : ''

    if (!reply.trim()) {
      throw new Error('AI API returned an empty response')
    }

    return reply
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
 * Get bilingual greeting message
 */
export function getBilingualGreeting(): BilingualContent {
  return {
    en: `Namaste! I'm Krishi Sahayak 🌾\nI can help you with your farming problems.\nYou can ask your questions.`,
    hi: `नमस्ते! मैं कृषि सहायक हूँ 🌾\nमैं आपकी खेती से जुड़ी समस्याओं में मदद कर सकता हूँ।\nआप अपना सवाल पूछ सकते हैं।`,
  }
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

/**
 * Generate a smart chat title from the first user question
 */
export function generateChatTitle(question: string, language: 'en' | 'hi' = 'en'): string {
  // Remove common question words and get the main topic
  const cleanQuestion = question
    .toLowerCase()
    .replace(/^(what|when|where|how|why|which|who|can|should|is|are|do|does|kya|kaise|kab|kahan|kyon)/gi, '')
    .trim()

  // Extract key farming terms
  const keywords = [
    { en: 'fertilizer', hi: 'उर्वरक', title: 'Fertilizer Advice' },
    { en: 'pest', hi: 'कीट', title: 'Pest Control' },
    { en: 'irrigation', hi: 'सिंचाई', title: 'Irrigation Tips' },
    { en: 'disease', hi: 'रोग', title: 'Disease Management' },
    { en: 'weather', hi: 'मौसम', title: 'Weather Impact' },
    { en: 'mandi', hi: 'मंडी', title: 'Market Prices' },
    { en: 'price', hi: 'भाव', title: 'Crop Pricing' },
    { en: 'wheat', hi: 'गेहूं', title: 'Wheat Farming' },
    { en: 'rice', hi: 'धान', title: 'Rice Farming' },
    { en: 'maize', hi: 'मक्का', title: 'Maize Farming' },
    { en: 'cotton', hi: 'कपास', title: 'Cotton Farming' },
    { en: 'vegetable', hi: 'सब्जी', title: 'Vegetable Farming' },
    { en: 'seed', hi: 'बीज', title: 'Seed Selection' },
    { en: 'harvest', hi: 'कटाई', title: 'Harvesting' },
    { en: 'soil', hi: 'मिट्टी', title: 'Soil Management' },
  ]

  const lowerQuestion = question.toLowerCase()
  
  // Find matching keyword
  for (const keyword of keywords) {
    if (lowerQuestion.includes(keyword.en) || lowerQuestion.includes(keyword.hi)) {
      return language === 'hi' 
        ? keyword.title.replace('Fertilizer', 'उर्वरक')
            .replace('Pest Control', 'कीट नियंत्रण')
            .replace('Irrigation', 'सिंचाई')
            .replace('Disease', 'रोग प्रबंधन')
            .replace('Weather', 'मौसम')
            .replace('Market', 'बाज़ार')
            .replace('Crop', 'फसल')
            .replace('Farming', 'खेती')
            .replace('Seed', 'बीज')
            .replace('Soil', 'मिट्टी')
        : keyword.title
    }
  }

  // If no keyword match, create a short title from the question
  const words = cleanQuestion.split(' ').slice(0, 4)
  const shortTitle = words.join(' ')
  
  if (shortTitle.length > 3) {
    return shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1)
  }

  return language === 'hi' ? 'खेती सलाह' : 'Farming Advice'
}

/**
 * Generate bilingual Krishi Advice (both English and Hindi)
 * Returns both versions for dynamic language switching
 */
export async function generateBilingualKrishiAdvice(
  message: string,
  userId: string,
  imageUrl?: string,
  farmerContext?: {
    location?: string
    crop?: string
    season?: string
  },
  primaryLanguage: 'en' | 'hi' = 'en'
): Promise<BilingualContent> {
  try {
    // Generate response in primary language
    const primaryResponse = await generateKrishiAdvice(
      message,
      userId,
      imageUrl,
      farmerContext,
      primaryLanguage
    )

    // Generate response in the other language
    const secondaryLanguage = primaryLanguage === 'en' ? 'hi' : 'en'
    const secondaryResponse = await generateKrishiAdvice(
      message,
      userId,
      imageUrl,
      farmerContext,
      secondaryLanguage
    )

    return primaryLanguage === 'en'
      ? { en: primaryResponse, hi: secondaryResponse }
      : { en: secondaryResponse, hi: primaryResponse }
  } catch (error) {
    console.error('Error generating bilingual advice:', error)
    // Fallback: return primary response for both languages
    const fallbackResponse = 'Sorry, I encountered an issue. Please try again.'
    return {
      en: fallbackResponse,
      hi: 'क्षमा करें, मुझे कोई समस्या आई। कृपया फिर से प्रयास करें।',
    }
  }
}

