'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import { GiPlantSeed } from 'react-icons/gi'
import { MdStorefront } from 'react-icons/md'
import { FaUsers, FaTruck } from 'react-icons/fa'
import { RiRobot2Line } from 'react-icons/ri'
import { HiOutlineChartBar } from 'react-icons/hi'
import { IoChevronForward, IoChevronBack } from 'react-icons/io5'
import BrandName from '@/components/ui/BrandName'

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
          <span className="text-krishi-indigo">कृषि</span>
          {' '}
          <span className="text-krishi-clay">{parts.slice(1).join(' ')}</span>
        </>
      )
    }
  } else {
    // English labels: Krishi X
    if (label.startsWith('Krishi ')) {
      const parts = label.split(' ')
      return (
        <>
          <span className="text-krishi-indigo">Krishi</span>
          {' '}
          <span className="text-krishi-clay">{parts.slice(1).join(' ')}</span>
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
      className={`sticky top-16 self-start h-[calc(100vh-4rem)] transition-all duration-300 flex flex-col ${
        expanded ? 'w-64' : 'w-16'
      }`}
      style={{
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRight: '1px solid rgba(196,106,61,0.25)',
        boxShadow: '2px 0 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header with Logo & Toggle */}
      <div className="flex items-center justify-center p-4" style={{ borderBottom: '1px solid rgba(196,106,61,0.25)' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(196,106,61,0.35)',
            color: '#2D2A6E',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <IoChevronBack size={20} /> : <IoChevronForward size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center mx-2 ${
              expanded ? 'justify-start px-4 space-x-3' : 'justify-center'
            } py-3`}
            style={{
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              ...(isActive(item.href)
                ? {
                    background: 'rgba(45,42,110,0.12)',
                    color: '#2D2A6E',
                  }
                : {
                    color: '#2D2A6E'
                  })
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.background = 'rgba(45,42,110,0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            title={!expanded ? item.label : ''}
          >
            <span className="flex-shrink-0" style={{ color: isActive(item.href) ? '#C46A3D' : '#2D2A6E', fontSize: '18px' }}>
              {item.icon}
            </span>
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
