'use client'

import Sidebar from '@/components/Sidebar'

interface FeaturePageLayoutProps {
  children: React.ReactNode
}

export default function FeaturePageLayout({ children }: FeaturePageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-krishi-bg">
      <Sidebar defaultExpanded={false} />
      <main className="flex-1 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
