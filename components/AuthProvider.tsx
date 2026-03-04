'use client'

import { AuthProvider } from '@/context/AuthContext'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
