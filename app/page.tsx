'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LandingNavbar from '@/components/LandingNavbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import FeatureGrid from '@/components/FeatureGrid'
import HowItWorks from '@/components/HowItWorks'
import AIHighlight from '@/components/AIHighlight'
import CTASection from '@/components/CTASection'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, farmerProfile, loading } = useAuth()

  useEffect(() => {
    // Only redirect if authenticated with a complete profile
    if (!loading && isAuthenticated && farmerProfile) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, farmerProfile, loading, router])

  // While loading auth state, show loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-krishi-primary border-t-krishi-heading"></div>
          <p className="mt-4 text-krishi-text">Loading...</p>
        </div>
      </main>
    )
  }

  // Show landing page if not authenticated or no profile
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <AIHighlight />
      <CTASection />
      <Footer />
    </div>
  )
}
