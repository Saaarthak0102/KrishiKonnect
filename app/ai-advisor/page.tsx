'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import {
  createNewChat,
  subscribeToChat,
  subscribeToChats,
  addMessageToChat,
  generateKrishiAdvice,
  uploadImageToStorage,
  deleteChat,
  updateChatTitle,
  getGreetingMessage,
  getFarmerContext,
  generateChatTitle,
  type AIChat,
  type AIMessage,
} from '@/lib/aiAdvisor'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ai-advisor/ChatWindow'
import ChatHistorySidebar from '@/components/ai-advisor/ChatHistorySidebar'
import LanguageToggle from '@/components/ui/LanguageToggle'

export default function AIAdvisorPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { lang } = useLanguage()

  // State management
  const [chats, setChats] = useState<AIChat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [farmContext, setFarmContext] = useState<{
    location: string
    crop: string
    temperature: string
    mandiPrice: string
    cropStage: string
    season?: string
  } | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const buildContextPreview = (context: {
    location?: string
    crop?: string
    season?: string
  } | null) => {
    const location = context?.location || 'Uttar Pradesh'
    const crop = context?.crop || 'Wheat'

    return {
      location,
      crop,
      season: context?.season || 'Rabi',
      cropStage: 'Tillering',
      temperature: '24°C',
      mandiPrice: '₹2150/q',
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Subscribe to user chats in real-time
  useEffect(() => {
    if (!user?.uid) return

    try {
      const unsubscribe = subscribeToChats(
        user.uid,
        (newChats) => {
          setChats(newChats)
          
          // If no current chat selected and chats exist, select the most recent
          if (!currentChatId && newChats.length > 0) {
            setCurrentChatId(newChats[0].id)
          }
          
          setIsLoadingChats(false)
        },
        (error) => {
          console.error('Error subscribing to chats:', error)
          setError('Failed to load chat list')
          setIsLoadingChats(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error('Error setting up chat subscription:', err)
      setIsLoadingChats(false)
    }
  }, [user?.uid, currentChatId])

  // Create first chat if user has no chats
  useEffect(() => {
    if (!user?.uid || chats.length > 0 || isLoadingChats) return

    const createFirstChat = async () => {
      try {
        const newChatId = await createNewChat(user.uid, lang as 'en' | 'hi')
        setCurrentChatId(newChatId)

        // Add greeting message
        await addMessageToChat(
          newChatId,
          'assistant',
          getGreetingMessage(lang as 'en' | 'hi')
        )
      } catch (err) {
        console.error('Error creating first chat:', err)
        setError(err instanceof Error ? err.message : 'Failed to create chat')
      }
    }

    createFirstChat()
  }, [user?.uid, chats.length, isLoadingChats, lang])

  // Subscribe to current chat messages
  useEffect(() => {
    if (!currentChatId) return

    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    setLoading(true)
    setMessages([])

    try {
      unsubscribeRef.current = subscribeToChat(
        currentChatId,
        (newMessages) => {
          setMessages(newMessages)
          setLoading(false)
        },
        (err) => {
          console.error('Chat subscription error:', err)
          setError('Failed to load messages')
        }
      )
    } catch (err) {
      console.error('Error subscribing to chat:', err)
      setError('Failed to load messages')
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [currentChatId])

  // Load context for UI chips when user is available
  useEffect(() => {
    if (!user?.uid) return

    const loadContext = async () => {
      try {
        const contextFromProfile = await getFarmerContext(user.uid)
        setFarmContext(buildContextPreview(contextFromProfile))
      } catch (err) {
        console.error('Error loading farm context:', err)
        setFarmContext(buildContextPreview(null))
      }
    }

    loadContext()
  }, [user?.uid])

  const handleNewChat = async () => {
    if (!user?.uid) return

    try {
      const newChatId = await createNewChat(user.uid, lang as 'en' | 'hi')
      const newChat: AIChat = {
        id: newChatId,
        userId: user.uid,
        title: lang === 'hi' ? 'नई चैट' : 'New Chat',
        createdAt: new Date(),
        language: lang as 'en' | 'hi',
      }
      setChats([newChat, ...chats])
      setCurrentChatId(newChatId)
      setMessages([])

      // Add greeting message
      await addMessageToChat(
        newChatId,
        'assistant',
        getGreetingMessage(lang as 'en' | 'hi')
      )
    } catch (err) {
      console.error('Error creating new chat:', err)
      setError(err instanceof Error ? err.message : 'Failed to create chat')
    }
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      setChats(chats.filter((c) => c.id !== chatId))
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
        if (chats.length > 1) {
          const nextChat = chats.find((c) => c.id !== chatId)
          if (nextChat) {
            setCurrentChatId(nextChat.id)
          }
        }
      }
    } catch (err) {
      console.error('Error deleting chat:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete chat')
    }
  }

  const handleSendMessage = async (
    content: string,
    imageFile?: File,
    imageUrl?: string
  ) => {
    if (!currentChatId || !user?.uid) return

    try {
      setError(null)

      // Get current chat to check if we should auto-generate title
      const currentChat = chats.find((c) => c.id === currentChatId)
      const isFirstMessage = messages.length === 1 // Only greeting message
      const isDefaultTitle = currentChat?.title === 'New Chat' || currentChat?.title === 'नई चैट'

      // Handle image upload if file is provided
      let finalImageUrl = imageUrl
      if (imageFile) {
        finalImageUrl = await uploadImageToStorage(imageFile, currentChatId, user.uid)
      }

      // Add user message
      await addMessageToChat(currentChatId, 'user', content, finalImageUrl)

      // Auto-generate title from first user message
      if (isFirstMessage && isDefaultTitle) {
        const autoTitle = generateChatTitle(content, lang as 'en' | 'hi')
        try {
          await updateChatTitle(currentChatId, autoTitle)
        } catch (err) {
          console.error('Error updating chat title:', err)
        }
      }

      // Refresh farmer context for every message so advice can stay current.
      const farmerContext = await getFarmerContext(user.uid)
      const contextPreview = buildContextPreview(farmerContext)
      setFarmContext(contextPreview)

      // Generate AI response
      const aiResponse = await generateKrishiAdvice(
        content,
        user.uid,
        finalImageUrl,
        farmerContext || undefined,
        lang as 'en' | 'hi'
      )

      // Add AI response
      await addMessageToChat(currentChatId, 'assistant', aiResponse)
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-krishi-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-krishi-primary border-t-krishi-agriculture rounded-full"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-krishi-bg overflow-hidden">
      {/* Header - Provides spacing for sticky sidebar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b-2 border-gray-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="w-28" />
          <h1 className="text-lg md:text-xl font-bold text-krishi-heading">
            {lang === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak'} 🌾
          </h1>
          <div className="w-28 flex justify-end">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* 3-Column Layout: Dashboard Sidebar | Chat Window | Chat History Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Dashboard Sidebar */}
        <Sidebar defaultExpanded={true} />

        {/* CENTER COLUMN: Chat Window */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          {/* Chat Area */}
          {currentChatId ? (
            <ChatWindow
              messages={messages}
              loading={loading}
              onSendMessage={handleSendMessage}
              error={error}
              onErrorDismiss={() => setError(null)}
              lang={lang}
              farmContext={farmContext}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">🌾</div>
                <h2 className="text-2xl font-bold text-krishi-heading mb-2">
                  {lang === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak'}
                </h2>
                <p className="text-krishi-text mb-6">
                  {lang === 'hi'
                    ? 'अपनी खेती से जुड़े सवालों के लिए AI सलाहकार से बात करें'
                    : 'Talk to your AI farming advisor'}
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-krishi-primary text-white rounded-lg font-semibold hover:bg-krishi-primary/90 transition-all"
                >
                  {lang === 'hi' ? 'नई चैट शुरू करें' : 'Start New Chat'}
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Chat History Sidebar */}
        {/* Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:flex">
          <ChatHistorySidebar
            chats={chats}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            lang={lang}
            userId={user?.uid}
          />
        </div>
      </div>
    </div>
  )
}
