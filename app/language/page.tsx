'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LanguageSelector from '@/components/LanguageSelector'

export default function LanguagePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if language is already selected
    const savedLang = localStorage.getItem('app_language')
    if (savedLang) {
      // If language already selected, redirect to login
      router.push('/login')
    }
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <LanguageSelector />
    </main>
  )
}
