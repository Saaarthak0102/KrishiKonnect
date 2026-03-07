'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createFarmerProfile } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

const PRIMARY_CROPS = [
  'Wheat',
  'Rice',
  'Maize',
  'Sugarcane',
  'Cotton',
  'Tobacco',
  'Groundnut',
  'Soybean',
  'Rapeseed',
  'Mustard',
  'Sunflower',
  'Linseed',
  'Onion',
  'Potato',
  'Tomato',
  'Garlic',
  'Ginger',
  'Turmeric',
  'Chilli',
  'Coriander',
  'Cumin',
  'Barley',
  'Oats',
  'Gram',
  'Lentil',
  'Pea',
  'Bean',
  'Apple',
  'Mango',
  'Banana',
  'Coconut',
  'Tea',
  'Coffee',
  'Cardamom',
]

export default function SetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { lang } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    state: '',
    primaryCrop: '',
  })

  if (!user) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.village || !formData.state || !formData.primaryCrop) {
        setError(lang === 'hi' ? 'कृपया सभी क्षेत्र भरें' : 'Please fill all fields')
        setLoading(false)
        return
      }

      // Create or update profile fields on users/{uid} while preserving existing fields.
      await createFarmerProfile(user.uid, {
        ...formData,
        phoneNumber: user.phoneNumber || '',
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error creating profile:', err)
      setError(
        lang === 'hi'
          ? 'प्रोफाइल बनाने में त्रुटि। कृपया कुछ समय बाद पुनः प्रयास करें'
          : 'Error creating profile. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const translations = {
    hi: {
      setupTitle: 'अपनी प्रोफाइल सेट करें',
      nameLabel: 'नाम',
      namePlaceholder: 'आपका नाम दर्ज करें',
      villageLabel: 'गांव/शहर',
      villagePlaceholder: 'अपना गांव/शहर दर्ज करें',
      stateLabel: 'राज्य',
      statePlaceholder: 'राज्य चुनें',
      cropLabel: 'प्राथमिक फसल',
      cropPlaceholder: 'अपनी मुख्य फसल चुनें',
      continueButton: 'कृषि दृष्टि पर जाएं',
      subtitle: 'अपनी कृषि प्रोफाइल पूरी करें',
    },
    en: {
      setupTitle: 'Set Up Your Profile',
      nameLabel: 'Name',
      namePlaceholder: 'Enter your name',
      villageLabel: 'Village/City',
      villagePlaceholder: 'Enter your village or city',
      stateLabel: 'State',
      statePlaceholder: 'Select state',
      cropLabel: 'Primary Crop',
      cropPlaceholder: 'Select your primary crop',
      continueButton: 'Continue to Krishi Drishti',
      subtitle: 'Complete your farming profile',
    },
  }

  const t = translations[lang]

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-6 z-50">
        <LanguageToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 md:p-12 max-w-md w-full"
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(196,106,61,0.55)',
          borderRadius: '16px',
          boxShadow: '0 12px 35px rgba(45,42,110,0.12), 0 4px 14px rgba(196,106,61,0.18)'
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#2D2A6E' }}>
            {t.setupTitle}
          </h1>
          <p style={{ color: 'rgba(45,42,110,0.75)' }}>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A6E' }}>
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.namePlaceholder}
              className="w-full px-4 py-3 transition-all duration-200"
              style={{
                border: '1px solid rgba(196,106,61,0.45)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.65)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C46A3D'
                e.target.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.15)'
                e.target.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(196,106,61,0.45)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Village Field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A6E' }}>
              {t.villageLabel}
            </label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder={t.villagePlaceholder}
              className="w-full px-4 py-3 transition-all duration-200"
              style={{
                border: '1px solid rgba(196,106,61,0.45)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.65)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C46A3D'
                e.target.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.15)'
                e.target.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(196,106,61,0.45)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* State Field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A6E' }}>
              {t.stateLabel}
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-3 transition-all duration-200"
              style={{
                border: '1px solid rgba(196,106,61,0.45)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.65)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C46A3D'
                e.target.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.15)'
                e.target.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(196,106,61,0.45)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="">{t.statePlaceholder}</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Crop Field */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2D2A6E' }}>
              {t.cropLabel}
            </label>
            <select
              value={formData.primaryCrop}
              onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
              className="w-full px-4 py-3 transition-all duration-200"
              style={{
                border: '1px solid rgba(196,106,61,0.45)',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.65)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C46A3D'
                e.target.style.boxShadow = '0 0 0 2px rgba(196,106,61,0.15)'
                e.target.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(196,106,61,0.45)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="">{t.cropPlaceholder}</option>
              {PRIMARY_CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
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
              borderRadius: '10px',
              boxShadow: '0 6px 18px rgba(196,106,61,0.18)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(196,106,61,0.22)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(196,106,61,0.18)'
            }}
          >
            {loading
              ? lang === 'hi'
                ? 'प्रोफाइल बना रहे हैं...'
                : 'Creating profile...'
              : t.continueButton}
          </motion.button>
        </form>
      </motion.div>
    </main>
  )
}
