'use client'

import Sidebar from '@/components/Sidebar'
import LanguageToggle from '@/components/LanguageToggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

interface FeaturePageLayoutProps {
  children: React.ReactNode
}

export default function FeaturePageLayout({ children }: FeaturePageLayoutProps) {
  const pathname = usePathname()
  const { lang } = useLanguage()

  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname.startsWith('/crop-library')) return lang === 'hi' ? 'फसल पुस्तकालय' : 'Crop Library'
    if (pathname === '/mandi') return lang === 'hi' ? 'मंडी भाव' : 'Mandi Prices'
    if (pathname === '/community') return lang === 'hi' ? 'समुदाय' : 'Community'
    if (pathname === '/ai-advisor') return lang === 'hi' ? 'AI सलाहकार' : 'AI Advisor'
    if (pathname === '/transport') return lang === 'hi' ? 'परिवहन' : 'Transport'
    return 'KrishiKonnect'
  }

  return (
    <div className="min-h-screen bg-krishi-bg flex flex-col">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Logo and Page Title */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🌾</span>
              <span className="font-bold text-krishi-heading text-lg hidden sm:inline">KrishiKonnect</span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <h1 className="text-lg md:text-xl font-semibold text-krishi-heading">
              {getPageTitle()}
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
