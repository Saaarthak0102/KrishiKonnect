'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'

interface SidebarProps {
  defaultExpanded?: boolean
}

export default function Sidebar({ defaultExpanded = false }: SidebarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { lang } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      icon: '🏠',
      label: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: '📚',
      label: lang === 'hi' ? 'फसल पुस्तकालय' : 'Crop Library',
      href: '/crop-library',
    },
    {
      icon: '💰',
      label: lang === 'hi' ? 'मंडी भाव' : 'Mandi Prices',
      href: '/mandi',
    },
    {
      icon: '🤝',
      label: lang === 'hi' ? 'समुदाय' : 'Community',
      href: '/community',
    },
    {
      icon: '🤖',
      label: lang === 'hi' ? 'AI सलाहकार' : 'AI Advisor',
      href: '/ai-advisor',
    },
    {
      icon: '🚚',
      label: lang === 'hi' ? 'परिवहन' : 'Transport',
      href: '/transport',
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-white border-r-2 border-gray-200 transition-all duration-300 z-40 flex flex-col ${
        expanded ? 'w-64' : 'w-16'
      }`}
      style={{
        backgroundColor: '#FFFFFF',
        borderRightColor: '#E5E7EB',
      }}
    >
      {/* Header with Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
        {expanded && (
          <Link href="/dashboard" className="flex items-center space-x-2 flex-1">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-krishi-heading text-sm">KrishiKonnect</span>
          </Link>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-gray-100 rounded-md flex-shrink-0 transition-colors duration-200"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '‹' : '›'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-krishi-bg border-l-4'
                : 'hover:bg-gray-100'
            }`}
            style={
              isActive(item.href)
                ? {
                    backgroundColor: '#FAF3E0',
                    borderLeftColor: '#1F3C88',
                    color: '#1F3C88',
                  }
                : {}
            }
            title={!expanded ? item.label : ''}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {expanded && (
              <span className="font-semibold text-sm whitespace-nowrap">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      {user && (
        <div className="p-3 border-t-2 border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title={!expanded ? 'Logout' : ''}
          >
            <span className="text-lg">🚪</span>
            {expanded && (
              <span className="font-semibold text-sm">
                {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
