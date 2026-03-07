'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { logout } from '@/lib/auth'
import LanguageToggle from '@/components/LanguageToggle'
import Sidebar from '@/components/Sidebar'
import { GiWheat } from 'react-icons/gi'
import BrandName from '@/components/ui/BrandName'

interface DashboardLayoutProps {
  children: React.ReactNode
  pageTitle?: string // e.g., "Krishi Fasal", "Krishi Bazaar", etc.
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, farmerProfile } = useAuth()
  const { lang } = useLanguage()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-detect page title based on pathname if not provided
  const getPageTitle = () => {
    if (pageTitle) return pageTitle
    
    if (pathname.startsWith('/crop-library')) return lang === 'hi' ? 'कृषि फसल' : 'Krishi Fasal'
    if (pathname.startsWith('/mandi')) return lang === 'hi' ? 'कृषि बाजार' : 'Krishi Bazaar'
    if (pathname.startsWith('/community')) return lang === 'hi' ? 'कृषि संघ' : 'Krishi Sangh'
    if (pathname.startsWith('/ai-advisor')) return lang === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak'
    if (pathname.startsWith('/transport')) return lang === 'hi' ? 'कृषि सेतु' : 'Krishi Setu'
    if (pathname.startsWith('/dashboard')) return lang === 'hi' ? 'कृषि दृष्टि' : 'Krishi Drishti'
    
    return null
  }

  const currentPageTitle = getPageTitle()

  // Helper function to render feature name with clay orange color
  const renderFeatureName = (title: string) => {
    if (!title) return null
    
    if (lang === 'hi') {
      // Hindi: कृषि X → render X in clay orange
      if (title.startsWith('कृषि ')) {
        const parts = title.split(' ')
        return (
          <>
            <span className="text-[#2D2A6E]">कृषि</span>
            {' '}
            <span className="text-[#C46A3D]">{parts.slice(1).join(' ')}</span>
          </>
        )
      }
    } else {
      // English: Krishi X → render X in clay orange
      if (title.startsWith('Krishi ')) {
        const parts = title.split(' ')
        return (
          <>
            <span className="text-[#2D2A6E]">Krishi</span>
            {' '}
            <span className="text-[#C46A3D]">{parts.slice(1).join(' ')}</span>
          </>
        )
      }
    }
    
    return <span className="text-[#C46A3D]">{title}</span>
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      alert(`Error logging out: ${errorMessage}`)
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Top Navbar */}
      <header 
        className="sticky top-0 z-50"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.35)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(196,106,61,0.25)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Left - Logo and Brand with Page Title */}
          <div className="flex items-center space-x-4">
            <GiWheat size={24} className="text-krishi-agriculture" />
            <span className="text-lg hidden sm:inline font-semibold">
              <span className="text-[#2D2A6E]">KrishiKonnect</span>
              {currentPageTitle && (
                <>
                  <span className="text-gray-400 mx-2">|</span>
                  {renderFeatureName(currentPageTitle)}
                </>
              )}
            </span>
          </div>

          {/* Center - Greeting Message */}
          <div className="flex-1 text-center hidden md:block">
            <h1 className="text-lg md:text-xl font-semibold" style={{ color: '#2D2A6E', fontWeight: 600 }}>
              {lang === 'hi' ? 'नमस्ते' : 'Namaste'}, {farmerProfile?.name || user?.phoneNumber}
            </h1>
          </div>

          {/* Right - User Info and Language Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-semibold" style={{ color: '#2D2A6E' }}>
                {farmerProfile?.village}, {farmerProfile?.state}
              </p>
              <p className="text-xs" style={{ color: 'rgba(45,42,110,0.6)' }}>
                {farmerProfile?.primaryCrop}
              </p>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        <Sidebar defaultExpanded={true} />

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
