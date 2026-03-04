'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import { logout } from '@/lib/auth'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, farmerProfile } = useAuth()
  const { lang, changeLang } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleLanguage = () => {
    const newLang = lang === 'hi' ? 'en' : 'hi'
    changeLang(newLang)
  }

  const navigationItems = [
    {
      name: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
      href: '/dashboard',
      icon: '🏠',
    },
    {
      name: lang === 'hi' ? 'फसल पुस्तकालय' : 'Crop Library',
      href: '/crop-library',
      icon: '🌾',
    },
    {
      name: lang === 'hi' ? 'मंडी भाव' : 'Mandi Prices',
      href: '/mandi',
      icon: '💰',
    },
    {
      name: lang === 'hi' ? 'समुदाय' : 'Community',
      href: '/community',
      icon: '🤝',
    },
    {
      name: lang === 'hi' ? 'परिवहन' : 'Transport',
      href: '/transport',
      icon: '🚚',
    },
    {
      name: lang === 'hi' ? 'AI सलाहकार' : 'AI Advisor',
      href: '/ai-advisor',
      icon: '🤖',
    },
  ]

  return (
    <div className="min-h-screen bg-krishi-bg flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r-2 border-krishi-border shadow-lg z-50
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b-2 border-krishi-border">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-krishi-heading">
                KrishiKonnect 🌾
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-krishi-text hover:bg-krishi-primary hover:text-white transition-colors duration-200"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Logout */}
          <div className="p-4 border-t-2 border-krishi-border space-y-2">
            <button
              onClick={toggleLanguage}
              className="w-full px-4 py-2 bg-krishi-primary text-white rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              {lang === 'hi' ? 'EN' : 'हिंदी'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b-2 border-krishi-border">
          <div className="px-4 py-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Welcome Message */}
            <div className="flex-1 ml-4">
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
