'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { logout } from '@/lib/auth'
import LanguageToggle from '@/components/LanguageToggle'
import Sidebar from '@/components/Sidebar'

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
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-krishi-bg flex">
      {/* Sidebar */}
      <Sidebar defaultExpanded={true} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pl-64 transition-all duration-300">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b-2 border-gray-200 relative">
          <div className="px-4 py-4 flex items-center justify-between">
            {/* Welcome Message */}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-krishi-heading">
                {lang === 'hi' ? 'स्वागत है' : 'Welcome back'}, {farmerProfile?.name || user?.phoneNumber} 👋
              </h1>
            </div>

            {/* User Info (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-krishi-text/60 font-semibold">
                  {farmerProfile?.village}, {farmerProfile?.state}
                </p>
                <p className="text-xs text-krishi-text/40">
                  {farmerProfile?.primaryCrop}
                </p>
              </div>
            </div>

            {/* Language Toggle - Top Right */}
            <div className="ml-4">
              <LanguageToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
