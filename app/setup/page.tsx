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

      // Create farmer profile
      const phoneNumber = user.phoneNumber || ''
      await createFarmerProfile(phoneNumber, formData)

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
      continueButton: 'डैशबोर्ड पर जाएं',
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
      continueButton: 'Continue to Dashboard',
      subtitle: 'Complete your farming profile',
    },
  }

  const t = translations[lang]

  return (
    <main className="min-h-screen flex items-center justify-center bg-krishi-bg p-4 relative">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-6 z-50">
        <LanguageToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-krishi-heading mb-2">
            {t.setupTitle}
          </h1>
          <p className="text-krishi-text/70">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-krishi-heading mb-2">
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.namePlaceholder}
              className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary"
            />
          </div>

          {/* Village Field */}
          <div>
            <label className="block text-sm font-semibold text-krishi-heading mb-2">
              {t.villageLabel}
            </label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder={t.villagePlaceholder}
              className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary"
            />
          </div>

          {/* State Field */}
          <div>
            <label className="block text-sm font-semibold text-krishi-heading mb-2">
              {t.stateLabel}
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary"
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
            <label className="block text-sm font-semibold text-krishi-heading mb-2">
              {t.cropLabel}
            </label>
            <select
              value={formData.primaryCrop}
              onChange={(e) => setFormData({ ...formData, primaryCrop: e.target.value })}
              className="w-full px-4 py-3 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary"
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
            className="w-full bg-krishi-primary text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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
