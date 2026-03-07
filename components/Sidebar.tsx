'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/lib/auth'
import type { IconType } from 'react-icons'
import { GiPlantSeed } from 'react-icons/gi'
import { MdInsights, MdLogout, MdSmartToy, MdStorefront } from 'react-icons/md'
import { FaUsers, FaTruck } from 'react-icons/fa'
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

  const menuItems: { icon: IconType; label: string; href: string }[] = [
    {
      icon: MdInsights,
      label: lang === 'hi' ? 'कृषि दृष्टि' : 'Krishi Drishti',
      href: '/dashboard',
    },
    {
      icon: GiPlantSeed,
      label: lang === 'hi' ? 'कृषि फसल' : 'Krishi Fasal',
      href: '/crop-library',
    },
    {
      icon: MdStorefront,
      label: lang === 'hi' ? 'कृषि बाजार' : 'Krishi Bazaar',
      href: '/mandi',
    },
    {
      icon: FaUsers,
      label: lang === 'hi' ? 'कृषि संघ' : 'Krishi Sangh',
      href: '/community',
    },
    {
      icon: MdSmartToy,
      label: lang === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak',
      href: '/ai-advisor',
    },
    {
      icon: FaTruck,
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
        background: 'transparent',
        borderRight: 'none',
        boxShadow: 'none'
      }}
    >
      {/* Header with Logo & Toggle */}
      <div className="flex items-center justify-center p-4">
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
              expanded ? 'justify-start px-4 gap-[14px]' : 'justify-center'
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
            <span
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center"
              style={{ color: isActive(item.href) ? '#C46A3D' : '#2D2A6E' }}
            >
              <item.icon size={24} />
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
        <div className="p-3 mt-8 mb-5">
          <div className="rounded-[12px] border border-[#C46A3D]">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${expanded ? 'justify-start px-3 gap-[10px]' : 'justify-center'} py-2 rounded-[12px] transition-colors duration-200`}
              style={{ color: '#2D2A6E' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(196,106,61,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              title={!expanded ? 'Logout' : ''}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[#C46A3D]">
                <MdLogout size={24} />
              </span>
              {expanded && (
                <span className="font-medium text-sm whitespace-nowrap text-[#2D2A6E]">
                  {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
