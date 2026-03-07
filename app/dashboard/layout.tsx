'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { logout } from '@/lib/auth'
import LanguageToggle from '@/components/LanguageToggle'
import Sidebar from '@/components/Sidebar'
import { GiWheat } from 'react-icons/gi'
import BrandName from '@/components/ui/BrandName'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, farmerProfile } = useAuth()
  const { lang } = useLanguage()

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
        className="sticky top-0 z-50 shadow-sm"
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(196,106,61,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Left - Logo and Brand */}
          <div className="flex items-center space-x-4">
            <GiWheat size={24} className="text-krishi-agriculture" />
            <span className="text-lg hidden sm:inline" style={{ color: '#2D2A6E' }}>
              <BrandName />
            </span>
          </div>

          {/* Center - Welcome Message */}
          <div className="flex-1 text-center hidden md:block">
            <h1 className="text-lg md:text-xl font-bold" style={{ color: '#2D2A6E' }}>
              {lang === 'hi' ? 'स्वागत है' : 'Welcome back'}, {farmerProfile?.name || user?.phoneNumber} 👋
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
