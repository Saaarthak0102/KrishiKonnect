import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthWrapper } from '@/components/AuthProvider'
import { MandiProvider } from '@/lib/MandiContext'
import { StarredCropsProvider } from '@/context/StarredCropsContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KrishiKonnect 🌾 - किसानों के लिए डिजिटल प्लेटफॉर्म',
  description: 'A farmer-friendly agricultural web platform connecting farmers with markets, knowledge, and community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthWrapper>
            <MandiProvider>
              <StarredCropsProvider>
                {children}
              </StarredCropsProvider>
            </MandiProvider>
          </AuthWrapper>
        </LanguageProvider>
      </body>
    </html>
  )
}
