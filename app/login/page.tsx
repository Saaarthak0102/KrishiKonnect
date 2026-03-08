'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { verifyOTP, checkFarmerProfile } from '@/lib/auth'
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import { FiTool } from 'react-icons/fi'

/**
 * FIREBASE TEST PHONE NUMBERS FOR DEVELOPMENT
 * 
 * To avoid reCAPTCHA challenges during development/testing, use Firebase test phone numbers:
 * 
 * Test Phone Number: +919876543210
 * Test OTP Code: 123456
 * 
 * Important: Test phone numbers only work in development. For production, real phone numbers are required.
 * Firebase will NOT trigger reCAPTCHA for test numbers.
 */

export default function LoginPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  // Initialize reCAPTCHA verifier once
  useEffect(() => {
    const w = window as any
    
    if (typeof window !== 'undefined' && !w.recaptchaVerifier) {
      try {
        w.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: (response: string) => {
              // reCAPTCHA verification succeeded silently
            },
            'expired-callback': () => {
              // reCAPTCHA token expired
              resetRecaptcha()
            },
            'error-callback': () => {
              // reCAPTCHA error occurred
              console.error('reCAPTCHA error occurred')
              resetRecaptcha()
            },
          }
        )
      } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error)
      }
    }

    // Cleanup: clear verifier on unmount
    return () => {
      const wCleanup = window as any
      if (wCleanup.recaptchaVerifier) {
        try {
          wCleanup.recaptchaVerifier.clear()
          delete wCleanup.recaptchaVerifier
        } catch (error) {
          // Silent fail on cleanup error
        }
      }
    }
  }, [])

  // Helper function to reset reCAPTCHA verifier
  const resetRecaptcha = () => {
    const w = window as any
    
    if (w.recaptchaVerifier) {
      try {
        w.recaptchaVerifier.clear()
        delete w.recaptchaVerifier
        
        // Reinitialize verifier for next attempt
        w.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: (response: string) => {
              // Verification succeeded
            },
          }
        )
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error)
      }
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      if (cleanPhone.length < 10) {
        setError(lang === 'hi' ? 'कृपया 10 अंकों का फोन नंबर दर्ज करें' : 'Please enter a valid 10-digit phone number')
        setLoading(false)
        return
      }

      // Format phone number for Indian numbers
      const formattedPhone = '+91' + cleanPhone.slice(-10)

      // Verify reCAPTCHA verifier exists
      const w = window as any
      const appVerifier = w.recaptchaVerifier
      if (!appVerifier) {
        setError(lang === 'hi' ? 'सुरक्षा सत्यापन विफल। कृपया पृष्ठ को रीलोड करें' : 'Security verification failed. Please reload the page.')
        setLoading(false)
        return
      }

      try {
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
        setConfirmationResult(result)
        setStep('otp')
      } catch (phoneAuthError: any) {
        // Handle specific reCAPTCHA errors
        if (phoneAuthError?.code === 'auth/invalid-phone-number') {
          setError(lang === 'hi' ? 'अमान्य फोन नंबर' : 'Invalid phone number')
        } else if (phoneAuthError?.code === 'auth/too-many-requests') {
          setError(lang === 'hi' ? 'बहुत सारे प्रयास। कृपया बाद में पुनः प्रयास करें' : 'Too many attempts. Please try again later.')
          resetRecaptcha()
        } else if (phoneAuthError?.message?.includes('reCAPTCHA')) {
          setError(lang === 'hi' ? 'सुरक्षा सत्यापन विफल। कृपया पुनः प्रयास करें' : 'Security verification failed. Please try again.')
          resetRecaptcha()
        } else {
          setError(
            lang === 'hi'
              ? 'OTP भेजने में त्रुटि। कृपया बाद में पुनः प्रयास करें'
              : 'Error sending OTP. Please try again later.'
          )
          resetRecaptcha()
        }
        console.error('Phone auth error:', phoneAuthError)
      }
    } catch (err: any) {
      console.error('Error in handlePhoneSubmit:', err)
      setError(
        lang === 'hi'
          ? 'OTP भेजने में त्रुटि। कृपया बाद में पुनः प्रयास करें'
          : 'Error sending OTP. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!confirmationResult) {
        setError(lang === 'hi' ? 'कुछ गलत हुआ। कृपया पुनः प्रयास करें' : 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      if (otp.length !== 6) {
        setError(lang === 'hi' ? 'कृपया 6 अंकों का OTP दर्ज करें' : 'Please enter a 6-digit OTP')
        setLoading(false)
        return
      }

      try {
        if (!confirmationResult) {
          throw new Error('OTP verification failed: confirmation result missing')
        }
        
        const signedInUser = await verifyOTP(confirmationResult, otp)

        // Check if profile exists in users/{uid}
        const profileExists = await checkFarmerProfile(signedInUser.uid)

        if (profileExists) {
          router.push('/dashboard')
        } else {
          router.push('/setup')
        }
      } catch (otpError: any) {
        console.error('Error verifying OTP:', otpError)
        
        // Reset reCAPTCHA on OTP verification failure
        resetRecaptcha()
        
        // Provide specific error messages
        if (otpError?.code === 'auth/invalid-verification-code') {
          setError(lang === 'hi' ? 'गलत OTP। कृपया सही OTP दर्ज करें' : 'Invalid OTP. Please enter the correct OTP.')
        } else if (otpError?.code === 'auth/code-expired') {
          setError(lang === 'hi' ? 'OTP की वैधता समाप्त हो गई। कृपया नया OTP प्राप्त करें' : 'OTP expired. Please request a new OTP.')
          // Return to phone entry step
          setTimeout(() => {
            setStep('phone')
            setOtp('')
            setPhoneNumber('')
          }, 2000)
        } else {
          setError(
            lang === 'hi'
              ? 'OTP सत्यापन विफल। कृपया सही OTP दर्ज करें'
              : 'OTP verification failed. Please enter the correct OTP.'
          )
        }
      }
    } catch (err: any) {
      console.error('Error in handleOtpSubmit:', err)
      setError(
        lang === 'hi'
          ? 'OTP सत्यापन विफल। कृपया पुनः प्रयास करें'
          : 'OTP verification failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const translations = {
    hi: {
      loginTitle: 'किसान लॉगिन',
      phoneLabel: 'फोन नंबर',
      phonePlaceholder: '10 अंकों का नंबर दर्ज करें',
      sendOtp: 'OTP भेजें',
      otpLabel: 'OTP दर्ज करें',
      otpPlaceholder: '6 अंकों का OTP',
      verifyOtp: 'OTP सत्यापित करें',
      backButton: 'वापस',
      subtitle: 'फोन नंबर से लॉगिन करें',
      otpSubtitle: 'अपने फोन पर भेजा गया OTP दर्ज करें',
    },
    en: {
      loginTitle: 'Farmer Login',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'Enter 10-digit number',
      sendOtp: 'Send OTP',
      otpLabel: 'Enter OTP',
      otpPlaceholder: '6-digit OTP',
      verifyOtp: 'Verify OTP',
      backButton: 'Back',
      subtitle: 'Login with phone number',
      otpSubtitle: 'Enter the OTP sent to your phone',
    },
  }

  const t = translations[lang]

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Development Login Card (Demo Helper) - Show in all non-production envs */}
      {(process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV !== 'production') && (
        <div
          className="fixed top-6 left-6 bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4 text-sm border border-orange-200 z-50"
          style={{ minWidth: 220, maxWidth: 260, color: '#C46A3D', fontFamily: 'inherit' }}
        >
          <div className="font-semibold text-orange-600 mb-2 flex items-center">
            <span className="mr-1">🔧</span> Development Mode
          </div>
          <div className="mb-2">
            <div className="font-medium text-orange-700">Check existing account</div>
            <div>Phone: <b>9876543210</b></div>
            <div>OTP: <b>12345</b></div>
          </div>
          <div>
            <div className="font-medium text-orange-700">Create new account</div>
            <div>9876543211</div>
            <div>9876543212</div>
            <div>9876543213</div>
            <div>9876543214</div>
            <div>9876543215</div>
            <div className="mt-1">OTP: <b>123456</b></div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 md:p-12 max-w-md w-full"
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(196,106,61,0.6)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(45,42,110,0.12), 0 4px 14px rgba(196,106,61,0.18)'
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2D2A6E' }}>
            {t.loginTitle}
          </h1>
          <p style={{ color: 'rgba(45,42,110,0.75)' }}>
            {step === 'phone' ? t.subtitle : t.otpSubtitle}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A6E' }}>
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full px-4 py-3 rounded-lg transition-all duration-200"
                style={{
                  border: '1px solid rgba(196,106,61,0.4)',
                  borderRadius: '10px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C46A3D'
                  e.target.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.15)'
                  e.target.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(196,106,61,0.4)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 px-6 font-semibold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              style={{
                background: '#C46A3D',
                borderRadius: '10px'
              }}
            >
              {loading ? (lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...') : t.sendOtp}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => router.push('/')}
              className="w-full font-semibold py-3 px-4 transition-all duration-250"
              style={{
                border: '1.5px solid #C46A3D',
                color: '#C46A3D',
                background: 'transparent',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(196,106,61,0.08)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(196,106,61,0.18)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {lang === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A6E' }}>
                {t.otpLabel}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t.otpPlaceholder}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest transition-all duration-200"
                style={{
                  border: '1px solid rgba(196,106,61,0.4)',
                  borderRadius: '10px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C46A3D'
                  e.target.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.15)'
                  e.target.style.outline = 'none'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(196,106,61,0.4)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 px-6 font-semibold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              style={{
                background: '#C46A3D',
                borderRadius: '10px'
              }}
            >
              {loading ? (lang === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Verifying...') : t.verifyOtp}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                resetRecaptcha()
                setStep('phone')
                setPhoneNumber('')
                setOtp('')
                setError('')
              }}
              className="w-full font-semibold py-2 hover:underline"
              style={{ color: '#C46A3D' }}
            >
              {t.backButton}
            </button>
          </form>
        )}

        {/* reCAPTCHA container - invisible */}
        <div id="recaptcha-container"></div>
      </motion.div>
    </main>
  )
}
