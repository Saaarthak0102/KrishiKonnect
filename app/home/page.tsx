'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect /home to / (root landing page)
    router.push('/')
  }, [router])

  return null
}
