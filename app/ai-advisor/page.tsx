'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { GiWheat } from 'react-icons/gi'
import { HiSparkles } from 'react-icons/hi'
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
      <div className="h-screen flex items-center justify-center">
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Updated to match DashboardLayout navbar style */}
      <header 
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(196,106,61,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Left - Logo and Brand with Page Title */}
          <div className="flex items-center space-x-4">
            <GiWheat size={24} className="text-krishi-agriculture" />
            <div className="flex items-center space-x-2">
              <span className="text-lg hidden sm:inline font-semibold">
                <span className="text-[#2D2A6E]">KrishiKonnect</span>
              </span>
              <span className="text-gray-400 mx-2 hidden sm:inline">|</span>
              <HiSparkles size={22} className="hidden sm:inline" style={{ color: '#2D2A6E', opacity: 0.9 }} />
              <span className="text-lg font-semibold" style={{ fontFamily: 'Poppins', fontSize: '1.5rem', fontWeight: 600 }}>
                <span style={{ color: '#2D2A6E' }}>Krishi</span>
                {' '}
                <span style={{ color: '#C46A3D' }}>Sahayak</span>
              </span>
            </div>
          </div>

          {/* Center - Greeting Message */}
          <div className="flex-1 text-center hidden md:block">
            <h1 className="text-lg md:text-xl font-semibold" style={{ color: '#2D2A6E', fontWeight: 600 }}>
              {lang === 'hi' ? 'नमस्ते' : 'Namaste'}
            </h1>
          </div>

          {/* Right - Language Toggle */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* 3-Column Layout: Krishi Drishti Sidebar | Chat Window | Chat History Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Krishi Drishti Sidebar */}
        <Sidebar defaultExpanded={true} />

        {/* CENTER COLUMN: Chat Window */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white/45 backdrop-blur-[2px]">
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
                <div className="text-6xl mb-4 flex justify-center">
                  <GiWheat size={64} className="text-krishi-agriculture" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {lang === 'hi' ? (
                    <>
                      <span className="text-krishi-indigo">कृषि</span>
                      {' '}
                      <span className="text-krishi-clay">सहायक</span>
                    </>
                  ) : (
                    <>
                      <span className="text-krishi-indigo">Krishi</span>
                      {' '}
                      <span className="text-krishi-clay">Sahayak</span>
                    </>
                  )}
                </h2>
                <p className="text-krishi-indigo mb-6">
                  {lang === 'hi'
                    ? 'अपनी खेती से जुड़े सवालों के लिए कृषि सहायक से बात करें'
                    : 'Talk to Krishi Sahayak for your farming questions'}
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-krishi-clay text-white rounded-lg font-semibold hover:bg-krishi-clay/90 transition-all"
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
