import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthWrapper } from '@/components/AuthProvider'
import { MandiProvider } from '@/lib/MandiContext'
import { StarredCropsProvider } from '@/context/StarredCropsContext'
import Grainient from '@/components/ui/Grainient'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KrishiKonnect - किसानों के लिए डिजिटल प्लेटफॉर्म',
  description: 'A farmer-friendly agricultural web platform connecting farmers with markets, knowledge, and community',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi">
      <body className={`${inter.className} relative min-h-screen`}>
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <Grainient
            color1="#dccba7"
            color2="#ecdec8"
            color3="#c3aa8c"
            timeSpeed={0.15}
            colorBalance={0.45}
            warpStrength={0.2}
            warpFrequency={4.1}
            warpSpeed={1.5}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.08}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={1.5}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>

        <div className="relative z-10">
          <LanguageProvider>
            <AuthWrapper>
              <MandiProvider>
                <StarredCropsProvider>{children}</StarredCropsProvider>
              </MandiProvider>
            </AuthWrapper>
          </LanguageProvider>
        </div>
      </body>
    </html>
  )
}
