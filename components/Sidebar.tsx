'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import { GiWheat, GiPlantSeed } from 'react-icons/gi'
import { MdStorefront } from 'react-icons/md'
import { FaUsers, FaTruck } from 'react-icons/fa'
import { RiRobot2Line } from 'react-icons/ri'
import { HiOutlineChartBar } from 'react-icons/hi'

interface SidebarProps {
  defaultExpanded?: boolean
}

// Helper function to render two-colored Krishi titles
function renderKrishiLabel(label: string, lang: 'hi' | 'en') {
  if (lang === 'hi') {
    // Hindi labels: कृषि X
    if (label.startsWith('कृषि ')) {
      const parts = label.split(' ')
      return (
        <>
          <span className="text-[#2D4B8C]">कृषि</span>
          {' '}
          <span className="text-[#C96A3A]">{parts.slice(1).join(' ')}</span>
        </>
      )
    }
  } else {
    // English labels: Krishi X
    if (label.startsWith('Krishi ')) {
      const parts = label.split(' ')
      return (
        <>
          <span className="text-[#2D4B8C]">Krishi</span>
          {' '}
          <span className="text-[#C96A3A]">{parts.slice(1).join(' ')}</span>
        </>
      )
    }
  }
  return <span>{label}</span>
}

export default function Sidebar({ defaultExpanded = false }: SidebarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { lang } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      icon: <HiOutlineChartBar size={20} />,
      label: lang === 'hi' ? 'कृषि दृष्टि' : 'Krishi Drishti',
      href: '/dashboard',
    },
    {
      icon: <GiPlantSeed size={20} />,
      label: lang === 'hi' ? 'कृषि फसल' : 'Krishi Fasal',
      href: '/crop-library',
    },
    {
      icon: <MdStorefront size={20} />,
      label: lang === 'hi' ? 'कृषि बाजार' : 'Krishi Bazaar',
      href: '/mandi',
    },
    {
      icon: <FaUsers size={20} />,
      label: lang === 'hi' ? 'कृषि संघ' : 'Krishi Sangh',
      href: '/community',
    },
    {
      icon: <RiRobot2Line size={20} />,
      label: lang === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak',
      href: '/ai-advisor',
    },
    {
      icon: <FaTruck size={20} />,
      label: lang === 'hi' ? 'कृषि सेतु' : 'Krishi Setu',
      href: '/transport',
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

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
    <aside
      className={`sticky top-16 self-start h-[calc(100vh-4rem)] bg-white/70 backdrop-blur-md border-r-2 border-gray-200 transition-all duration-300 flex flex-col ${
        expanded ? 'w-64' : 'w-16'
      }`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRightColor: '#E5E7EB',
      }}
    >
      {/* Header with Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
        {expanded && (
          <Link href="/dashboard" className="flex items-center space-x-2 flex-1">
            <GiWheat size={24} className="text-krishi-primary" />
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
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center rounded-lg mx-2 transition-all duration-200 ${
              expanded ? 'justify-start px-4 space-x-3' : 'justify-center'
            } py-3 ${
              isActive(item.href)
                ? 'bg-white/60 backdrop-blur-sm'
                : 'hover:bg-gray-100'
            }`}
            style={
              isActive(item.href)
                ? {
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    color: '#1F3C88',
                  }
                : {}
            }
            title={!expanded ? item.label : ''}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {expanded && (
              <span className="font-semibold text-sm whitespace-nowrap">
                {renderKrishiLabel(item.label, lang)}
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
    </aside>
  )
}
