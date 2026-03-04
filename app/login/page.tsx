'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { sendOTP, verifyOTP, checkFarmerProfile } from '@/lib/auth'
import { ConfirmationResult } from 'firebase/auth'
import { useLanguage } from '@/lib/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const recaptchaContainerId = useRef('recaptcha-container')

  useEffect(() => {
    // Create recaptcha container
    const container = document.getElementById(recaptchaContainerId.current)
    if (!container) {
      const div = document.createElement('div')
      div.id = recaptchaContainerId.current
      document.body.appendChild(div)
    }
  }, [])

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

      const result = await sendOTP(formattedPhone, recaptchaContainerId.current)
      setConfirmationResult(result)
      setStep('otp')
    } catch (err: any) {
      console.error('Error sending OTP:', err)
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
        return
      }

      if (otp.length !== 6) {
        setError(lang === 'hi' ? 'कृपया 6 अंकों का OTP दर्ज करें' : 'Please enter a 6-digit OTP')
        setLoading(false)
        return
      }

      await verifyOTP(confirmationResult, otp)

      // Check if farmer profile exists
      const cleanPhone = phoneNumber.replace(/\D/g, '')
      const formattedPhone = '+91' + cleanPhone.slice(-10)
      const profileExists = await checkFarmerProfile(formattedPhone)

      if (profileExists) {
        router.push('/dashboard')
      } else {
        router.push('/setup')
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err)
      setError(
        lang === 'hi'
          ? 'OTP सत्यापन विफल। कृपया सही OTP दर्ज करें'
          : 'OTP verification failed. Please enter the correct OTP.'
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
    <main className="min-h-screen flex items-center justify-center bg-krishi-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-krishi-heading mb-2">
            {t.loginTitle}
          </h1>
          <p className="text-krishi-text/70">
            {step === 'phone' ? t.subtitle : t.otpSubtitle}
          </p>
        </div>

        <div id={recaptchaContainerId.current} className="mb-4"></div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-krishi-heading mb-2">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary"
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
              className="w-full bg-krishi-primary text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...') : t.sendOtp}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-krishi-heading mb-2">
                {t.otpLabel}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t.otpPlaceholder}
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary text-center text-2xl tracking-widest"
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
              className="w-full bg-krishi-primary text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (lang === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Verifying...') : t.verifyOtp}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                setStep('phone')
                setPhoneNumber('')
                setOtp('')
                setError('')
              }}
              className="w-full text-krishi-primary font-semibold py-2 hover:underline"
            >
              {t.backButton}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  )
}
