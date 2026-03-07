'use client'

import Sidebar from '@/components/Sidebar'
import LanguageToggle from '@/components/LanguageToggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import BrandName from '@/components/ui/BrandName'

interface FeaturePageLayoutProps {
  children: React.ReactNode
}

// Helper function to render two-colored Krishi titles
function renderKrishiTitle(title: string, lang: 'hi' | 'en') {
  if (title === '__brand__') {
    return <BrandName />
  }

  if (lang === 'hi') {
    // Hindi titles: कृषि X
    if (title.startsWith('कृषि ')) {
      const parts = title.split(' ')
      return (
        <>
          <span className="text-[#2D4B8C]">कृषि</span>
          {' '}
          <span className="text-[#C96A3A]">{parts.slice(1).join(' ')}</span>
        </>
      )
    }
  } else {
    // English titles: Krishi X
    if (title.startsWith('Krishi ')) {
      const parts = title.split(' ')
      return (
        <>
          <span className="text-[#2D4B8C]">Krishi</span>
          {' '}
          <span className="text-[#C96A3A]">{parts.slice(1).join(' ')}</span>
        </>
      )
    }
  }
  return <span className="text-krishi-heading">{title}</span>
}

export default function FeaturePageLayout({ children }: FeaturePageLayoutProps) {
  const pathname = usePathname()
  const { lang } = useLanguage()

  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname.startsWith('/crop-library')) return lang === 'hi' ? 'कृषि फसल' : 'Krishi Fasal'
    if (pathname === '/mandi') return lang === 'hi' ? 'कृषि बाजार' : 'Krishi Bazaar'
    if (pathname === '/community') return lang === 'hi' ? 'कृषि संघ' : 'Krishi Sangh'
    if (pathname === '/ai-advisor') return lang === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak'
    if (pathname === '/transport') return lang === 'hi' ? 'कृषि सेतु' : 'Krishi Setu'
    return '__brand__'
  }

  const pageTitle = getPageTitle()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm border-b-2 border-gray-200 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Logo and Page Title */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🌾</span>
              <span className="text-lg hidden sm:inline">
                <BrandName />
              </span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <h1 className="text-lg md:text-xl font-semibold">
              {renderKrishiTitle(pageTitle, lang)}
            </h1>
          </div>

          {/* Language Toggle */}
          <div className="flex-shrink-0">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        <Sidebar defaultExpanded={false} />
        <main className="flex-1 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  )
}
