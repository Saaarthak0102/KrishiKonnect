'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FeaturePageLayout from '@/components/FeaturePageLayout'
import Footer from '@/components/Footer'
import RecommendedMandiCard from '@/components/RecommendedMandiCard'
import { useLanguage } from '@/lib/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import cropsData from '@/data/crops.json'
import { useMandiPrices } from '@/lib/MandiContext'
import {
  generateBookingId,
  getTransportBookingById,
  saveTransportBooking,
  type TransportBookingRecord
} from '@/lib/transportBookings'

interface TransportRequest {
  farmerId: string
  crop: string
  quantity: string
  pickupVillage: string
  destinationMandi: string
  preferredDate: string
  phoneNumber: string
  transporter?: Transporter
  estimatedPrice?: number
  status: 'pending' | 'confirmed' | 'completed'
}

interface Transporter {
  id: string
  name: string
  rating: number
  price: number
  availability: string
  driverContact: string
}

interface MandiPriceRecord {
  id: string
  crop: string
  state: string
  mandi: string
  modalPrice: number
  trend: {
    direction: 'up' | 'down' | 'stable'
  }
}

interface RecommendedMandi extends MandiPriceRecord {
  score: number
  isHighestPrice: boolean
  isNearbyState: boolean
  trendScore: number
}

function calculateRecommendedMandi(
  crop: string,
  farmerState: string | undefined,
  prices: MandiPriceRecord[]
): RecommendedMandi | null {
  if (!crop) return null

  const normalizedCrop = crop.trim().toLowerCase()
  const normalizedFarmerState = farmerState?.trim().toLowerCase() || ''

  const cropMandis = prices.filter((price) => price.crop.trim().toLowerCase() === normalizedCrop)
  if (cropMandis.length === 0) return null

  const sortedByPrice = [...cropMandis].sort((a, b) => b.modalPrice - a.modalPrice)
  const highestModalPrice = sortedByPrice[0].modalPrice

  const scoredMandis = sortedByPrice.map((price) => {
    const isHighestPrice = price.modalPrice === highestModalPrice
    const isNearbyState =
      normalizedFarmerState.length > 0 && price.state.trim().toLowerCase() === normalizedFarmerState

    const priceScore = isHighestPrice ? 50 : 0
    const proximityScore = isNearbyState ? 30 : 0
    const trendScore =
      price.trend.direction === 'up' ? 20 : price.trend.direction === 'stable' ? 10 : 0

    return {
      ...price,
      score: priceScore + proximityScore + trendScore,
      isHighestPrice,
      isNearbyState,
      trendScore
    }
  })

  scoredMandis.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.modalPrice - a.modalPrice
  })

  return scoredMandis[0]
}

// Mock transporter data
const mockTransporters: Transporter[] = [
  {
    id: 'raj-truck',
    name: 'Raj Truck Service',
    rating: 4.5,
    price: 1200,
    availability: 'Available Today',
    driverContact: '9812345621'
  },
  {
    id: 'singh-transport',
    name: 'Singh Transport Co.',
    rating: 4.8,
    price: 1350,
    availability: 'Available Tomorrow',
    driverContact: '9823456732'
  },
  {
    id: 'farmers-logistics',
    name: 'Farmers Logistics',
    rating: 4.3,
    price: 1150,
    availability: 'Available Today',
    driverContact: '9834567843'
  },
  {
    id: 'green-wheels',
    name: 'Green Wheels Transport',
    rating: 4.6,
    price: 1280,
    availability: 'Available in 2 days',
    driverContact: '9845678954'
  },
  {
    id: 'fast-cargo',
    name: 'Fast Cargo Services',
    rating: 4.4,
    price: 1220,
    availability: 'Available Today',
    driverContact: '9856789065'
  }
]

export default function TransportPage() {
  const { lang } = useLanguage()
  const { farmerProfile } = useAuth()
  const { prices } = useMandiPrices()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get URL parameters
  const cropFromUrl = searchParams.get('crop') || ''
  const mandiFromUrl = searchParams.get('mandi') || ''
  const bookingIdFromUrl = searchParams.get('bookingId') || ''
  const isReceiptRoute = Boolean(bookingIdFromUrl)

  // Form state
  const [formData, setFormData] = useState<TransportRequest>({
    farmerId: '',
    crop: '',
    quantity: '',
    pickupVillage: '',
    destinationMandi: '',
    preferredDate: '',
    phoneNumber: '',
    status: 'pending'
  })

  const [step, setStep] = useState<'form' | 'estimate' | 'transporters' | 'confirmed'>('form')
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<{ min: number; max: number }>({ min: 0, max: 0 })
  const [bookingRecord, setBookingRecord] = useState<TransportBookingRecord | null>(null)
  const [isBookingLookupComplete, setIsBookingLookupComplete] = useState(!isReceiptRoute)

  const cropOptions = useMemo(
    () =>
      cropsData.map((crop) => ({
        id: crop.id,
        nameEn: crop.name_en,
        nameHi: crop.name_hi
      })),
    []
  )

  const selectedCropMarketName = useMemo(() => {
    const selectedCrop = cropOptions.find((crop) => crop.id === formData.crop)
    return selectedCrop?.nameEn || formData.crop
  }, [cropOptions, formData.crop])

  const getRecommendedMandi = (crop: string, farmerState: string | undefined) =>
    calculateRecommendedMandi(crop, farmerState, prices)

  const recommendedMandi = useMemo(
    () => getRecommendedMandi(selectedCropMarketName, farmerProfile?.state),
    [selectedCropMarketName, farmerProfile?.state, prices]
  )

  const recommendationReasons = useMemo(() => {
    if (!recommendedMandi) return []

    const reasons: string[] = []
    if (recommendedMandi.isHighestPrice) {
      reasons.push(lang === 'hi' ? 'सबसे बेहतर बाजार भाव' : 'Highest market price')
    }
    if (recommendedMandi.isNearbyState) {
      reasons.push(lang === 'hi' ? 'नजदीकी राज्य की मंडी' : 'Nearby state mandi')
    }
    if (recommendedMandi.trendScore === 20) {
      reasons.push(lang === 'hi' ? 'बाजार रुझान ऊपर जा रहा है' : 'Market trend rising')
    } else if (recommendedMandi.trendScore === 10) {
      reasons.push(lang === 'hi' ? 'बाजार रुझान स्थिर है' : 'Market trend stable')
    }

    if (reasons.length === 0) {
      reasons.push(lang === 'hi' ? 'भाव और दूरी के आधार पर बेहतर विकल्प' : 'Balanced score for price and distance')
    }

    return reasons
  }, [recommendedMandi, lang])

  const mandiOptions = useMemo(() => {
    if (!selectedCropMarketName) return []

    const filteredByCrop = prices.filter(
      (price) => price.crop.trim().toLowerCase() === selectedCropMarketName.trim().toLowerCase()
    )

    const sortedByPrice = [...filteredByCrop].sort((a, b) => b.modalPrice - a.modalPrice)

    const options = sortedByPrice.map((price) => ({
      id: price.id,
      mandi: price.mandi,
      state: price.state,
      modalPrice: price.modalPrice,
      value: `${price.mandi} (${price.state})`,
      label: `${price.mandi} — ₹${price.modalPrice.toLocaleString('en-IN')}`
    }))

    if (!recommendedMandi) return options

    const recommendedIndex = options.findIndex((option) => option.id === recommendedMandi.id)
    if (recommendedIndex <= 0) return options

    const recommendedOption = options[recommendedIndex]
    const remainingOptions = options.filter((option) => option.id !== recommendedMandi.id)
    return [recommendedOption, ...remainingOptions]
  }, [prices, selectedCropMarketName, recommendedMandi])

  const selectedCropLabel = useMemo(() => {
    const selectedCrop = cropOptions.find((crop) => crop.id === formData.crop)
    if (!selectedCrop) return formData.crop
    return lang === 'hi' ? selectedCrop.nameHi : selectedCrop.nameEn
  }, [cropOptions, formData.crop, lang])

  useEffect(() => {
    if (!isReceiptRoute) {
      setIsBookingLookupComplete(true)
      return
    }

    const storedBooking = getTransportBookingById(bookingIdFromUrl)
    setBookingRecord(storedBooking)
    setStep('confirmed')
    setIsBookingLookupComplete(true)
  }, [bookingIdFromUrl, isReceiptRoute])

  useEffect(() => {
    if (!formData.crop && formData.destinationMandi) {
      setFormData((prev) => ({ ...prev, destinationMandi: '' }))
      return
    }

    if (!formData.destinationMandi) return

    const selectedMandiExists = mandiOptions.some((option) => option.value === formData.destinationMandi)
    if (!selectedMandiExists) {
      setFormData((prev) => ({ ...prev, destinationMandi: '' }))
    }
  }, [formData.crop, formData.destinationMandi, mandiOptions])

  const isFormValid = Boolean(
    formData.crop && formData.destinationMandi && formData.quantity && formData.preferredDate
  )

  // Auto-fill from farmer profile when available
  useEffect(() => {
    if (farmerProfile) {
      setFormData(prev => ({
        ...prev,
        farmerId: farmerProfile.name,
        pickupVillage: farmerProfile.village,
        phoneNumber: farmerProfile.phoneNumber
      }))
    }
  }, [farmerProfile])

  const normalizeValue = (value: string) => value.trim().toLowerCase()

  // Map URL params to valid dropdown option values once options are available.
  useEffect(() => {
    if (!cropFromUrl && !mandiFromUrl) return

    setFormData((prev) => {
      let resolvedCrop = prev.crop
      let resolvedMandi = prev.destinationMandi

      if (cropFromUrl) {
        const normalizedCropParam = normalizeValue(cropFromUrl)
        const matchedCrop = cropOptions.find(
          (crop) =>
            normalizeValue(crop.id) === normalizedCropParam ||
            normalizeValue(crop.nameEn) === normalizedCropParam ||
            normalizeValue(crop.nameHi) === normalizedCropParam
        )
        resolvedCrop = matchedCrop?.id || prev.crop
      }

      if (mandiFromUrl && mandiOptions.length > 0) {
        const normalizedMandiParam = normalizeValue(mandiFromUrl)
        const matchedMandi = mandiOptions.find(
          (mandiOption) =>
            normalizeValue(mandiOption.mandi) === normalizedMandiParam ||
            normalizeValue(mandiOption.value) === normalizedMandiParam
        )
        resolvedMandi = matchedMandi?.value || prev.destinationMandi
      }

      if (resolvedCrop === prev.crop && resolvedMandi === prev.destinationMandi) {
        return prev
      }

      return {
        ...prev,
        crop: resolvedCrop,
        destinationMandi: resolvedMandi
      }
    })
  }, [cropFromUrl, mandiFromUrl, cropOptions, mandiOptions])

  // Calculate estimated cost based on destination
  const calculateEstimatedCost = useMemo(() => {
    if (!formData.destinationMandi || !farmerProfile?.state) {
      return { min: 500, max: 2000 }
    }

    // Extract state from mandi name if it contains state info in parentheses
    const mandiStateName = formData.destinationMandi.match(/\(([^)]+)\)/)?.[1] || ''
    const userState = farmerProfile.state

    // Determine distance type
    let basePrice = 1000
    if (mandiStateName.toLowerCase().includes(userState.toLowerCase())) {
      // Same state
      basePrice = 1000
    } else if (mandiStateName) {
      // Different state
      basePrice = 2000
    } else {
      // Assume local if no state info
      basePrice = 500
    }

    return {
      min: basePrice - 200,
      max: basePrice + 300
    }
  }, [formData.destinationMandi, farmerProfile?.state])

  useEffect(() => {
    setEstimatedCost(calculateEstimatedCost)
  }, [calculateEstimatedCost])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      setStep('estimate')
      setTimeout(() => setStep('transporters'), 500)
    }
  }

  const handleBookTransport = (transporter: Transporter) => {
    const pickupDate = new Date(formData.preferredDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const booking: TransportBookingRecord = {
      id: generateBookingId(),
      type: 'transport',
      crop: selectedCropMarketName,
      quantity: Number(formData.quantity),
      pickupVillage: formData.pickupVillage,
      destinationMandi: formData.destinationMandi,
      provider: transporter.name,
      driverContact: transporter.driverContact,
      pickupDate,
      estimatedArrival: '7 AM',
      cost: transporter.price,
      status: 'confirmed',
      createdAt: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    saveTransportBooking(booking)
    setBookingRecord(booking)
    setSelectedTransporter(transporter)
    setFormData(prev => ({
      ...prev,
      transporter,
      estimatedPrice: transporter.price,
      status: 'confirmed'
    }))
    setStep('confirmed')
    router.replace(`/transport?bookingId=${booking.id}`)
  }

  const handleBackToMandi = () => {
    router.push('/mandi')
  }

  const handleUseRecommendedMandi = () => {
    if (!recommendedMandi) return
    setFormData((prev) => ({
      ...prev,
      destinationMandi: `${recommendedMandi.mandi} (${recommendedMandi.state})`
    }))
  }

  const handlePrintReceipt = () => {
    document.body.classList.add('transport-receipt-print')
    window.print()
    document.body.classList.remove('transport-receipt-print')
  }

  const activeBooking = bookingRecord

  return (
    <FeaturePageLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#F9F6F0' }}>
        <main className="container mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <h1 className="mb-3 text-4xl font-bold md:text-5xl" style={{ color: '#1F3C88' }}>
              {lang === 'hi' ? '🚛 परिवहन बुकिंग' : '🚛 Transport Booking'}
            </h1>
            <p className="mx-auto max-w-3xl text-gray-700">
              {lang === 'hi'
                ? 'अपनी फसल को मंडी तक पहुंचाने के लिए परिवहन बुक करें'
                : 'Book transport to send your crops to the mandi'}
            </p>
          </motion.div>

          {/* Step 1: Transport Request Form */}
          {!isReceiptRoute && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 rounded-xl border-2 p-6 md:p-8"
            style={{ borderColor: '#E8DCC8', backgroundColor: '#FAF3E0' }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1F3C88' }}>
              {lang === 'hi' ? 'परिवहन विवरण' : 'Transport Details'}
            </h2>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup Village */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
                    {lang === 'hi' ? 'पिकअप गाँव' : 'Pickup Village'}
                  </label>
                  <input
                    type="text"
                    name="pickupVillage"
                    value={formData.pickupVillage}
                    onChange={handleInputChange}
                    placeholder={lang === 'hi' ? 'गाँव का नाम' : 'Village name'}
                    className="w-full rounded-lg border-2 px-4 py-3 outline-none transition-colors"
                    style={{
                      borderColor: '#D8CFC0',
                      color: '#1F3C88',
                      backgroundColor: '#FFFFFF'
                    }}
                    readOnly={!!farmerProfile?.village}
                  />
                </div>

                {/* Crop */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
                    {lang === 'hi' ? 'फसल' : 'Crop'} *
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    className="h-12 w-full rounded-md border px-4 py-3 outline-none transition-colors"
                    style={{
                      borderColor: '#D8CFC0',
                      color: '#1F3C88',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="">{lang === 'hi' ? 'फसल चुनें' : 'Select Crop'}</option>
                    {cropOptions.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {lang === 'hi' ? crop.nameHi : crop.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recommendation Card */}
                {formData.crop && recommendedMandi && (
                  <div className="md:col-span-2">
                    <RecommendedMandiCard
                      cropLabel={selectedCropLabel}
                      mandiName={recommendedMandi.mandi}
                      state={recommendedMandi.state}
                      modalPrice={recommendedMandi.modalPrice}
                      reasons={recommendationReasons}
                      onUse={handleUseRecommendedMandi}
                      lang={lang}
                    />
                  </div>
                )}

                {/* Destination Mandi */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
                    {lang === 'hi' ? 'गंतव्य मंडी' : 'Destination Mandi'} *
                  </label>
                  <select
                    name="destinationMandi"
                    value={formData.destinationMandi}
                    onChange={handleInputChange}
                    className="h-12 w-full rounded-md border px-4 py-3 outline-none transition-colors"
                    style={{
                      borderColor: '#D8CFC0',
                      color: '#1F3C88',
                      backgroundColor: '#FFFFFF'
                    }}
                    disabled={!formData.crop}
                  >
                    <option value="">
                      {lang === 'hi'
                        ? formData.crop
                          ? 'मंडी चुनें'
                          : 'पहले फसल चुनें'
                        : formData.crop
                          ? 'Select Mandi'
                          : 'Select crop first'}
                    </option>
                    {mandiOptions.map((mandiOption) => (
                      <option key={mandiOption.id} value={mandiOption.value}>
                        {mandiOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
                    {lang === 'hi' ? 'मात्रा (क्विंटल)' : 'Quantity (Quintals)'} *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder={lang === 'hi' ? 'क्विंटल में मात्रा' : 'Quantity in quintals'}
                    required
                    min="1"
                    className="w-full rounded-lg border-2 px-4 py-3 outline-none transition-colors"
                    style={{
                      borderColor: '#D8CFC0',
                      color: '#1F3C88',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1F3C88'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D8CFC0'
                    }}
                  />
                </div>

                {/* Preferred Pickup Date */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
                    {lang === 'hi' ? 'पिकअप की तारीख' : 'Preferred Pickup Date'} *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border-2 px-4 py-3 outline-none transition-colors"
                    style={{
                      borderColor: '#D8CFC0',
                      color: '#1F3C88',
                      backgroundColor: '#FFFFFF'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1F3C88'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D8CFC0'
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1F3C88' }}>
                    {lang === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder={lang === 'hi' ? 'फ़ोन नंबर' : 'Phone number'}
                    className="w-full rounded-lg border-2 px-4 py-3 outline-none transition-colors"
                    style={{
                      borderColor: '#D8CFC0',
                      color: '#1F3C88',
                      backgroundColor: '#FFFFFF'
                    }}
                    readOnly={!!farmerProfile?.phoneNumber}
                  />
                </div>
              </div>

              {/* Submit Button */}
              {step === 'form' && (
                <motion.button
                  type="submit"
                  disabled={!isFormValid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full md:w-auto px-8 py-4 rounded-lg font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"
                  style={{ backgroundColor: isFormValid ? '#1F3C88' : '#94A3B8' }}
                  onMouseEnter={(e) => {
                    if (!isFormValid) return
                    e.currentTarget.style.backgroundColor = '#162847'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isFormValid ? '#1F3C88' : '#94A3B8'
                  }}
                >
                  {lang === 'hi' ? 'परिवहन खोजें' : 'Find Transport'}
                </motion.button>
              )}
            </form>
          </motion.div>
          )}

          {/* Step 2: Transport Cost Estimate */}
          {!isReceiptRoute && (step === 'estimate' || step === 'transporters' || step === 'confirmed') && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 rounded-xl border-2 p-6 md:p-8"
              style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1F3C88' }}>
                {lang === 'hi' ? '💰 अनुमानित परिवहन लागत' : '💰 Estimated Transport Cost'}
              </h2>
              <p className="text-gray-600 mb-4">
                {lang === 'hi'
                  ? `${formData.pickupVillage} से ${formData.destinationMandi} के लिए`
                  : `From ${formData.pickupVillage} to ${formData.destinationMandi}`}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: '#7FB069' }}>
                  ₹{estimatedCost.min.toLocaleString('en-IN')}
                </span>
                <span className="text-2xl text-gray-600">-</span>
                <span className="text-4xl font-bold" style={{ color: '#7FB069' }}>
                  ₹{estimatedCost.max.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {lang === 'hi' ? 'परिवहन प्रदाता के आधार पर कीमत भिन्न हो सकती है' : 'Price may vary based on transport provider'}
              </p>
            </motion.div>
          )}

          {/* Step 3: Available Transporters */}
          {!isReceiptRoute && (step === 'transporters' || step === 'confirmed') && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1F3C88' }}>
                {lang === 'hi' ? '🚚 उपलब्ध परिवहन सेवाएं' : '🚚 Available Transporters'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTransporters.map((transporter, idx) => (
                  <motion.div
                    key={transporter.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="rounded-xl border-2 p-6 transition-all hover:shadow-lg"
                    style={{
                      borderColor: step === 'confirmed' && selectedTransporter?.id === transporter.id ? '#7FB069' : '#E8DCC8',
                      backgroundColor: '#FAF3E0'
                    }}
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#1F3C88' }}>
                        🚛 {transporter.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold" style={{ color: '#1F3C88' }}>
                          {transporter.rating}
                        </span>
                        <span className="text-gray-500 text-sm">/5.0</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {transporter.availability}
                      </p>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-300">
                      <p className="text-3xl font-bold" style={{ color: '#7FB069' }}>
                        ₹{transporter.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {lang === 'hi' ? 'कुल लागत' : 'Total cost'}
                      </p>
                    </div>

                    {step === 'transporters' && (
                      <button
                        onClick={() => handleBookTransport(transporter)}
                        className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95"
                        style={{ backgroundColor: '#B85C38' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#A04D2F'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#B85C38'
                        }}
                      >
                        {lang === 'hi' ? 'बुक करें' : 'Book Transport'}
                      </button>
                    )}

                    {step === 'confirmed' && selectedTransporter?.id === transporter.id && (
                      <div className="py-3 px-4 rounded-lg font-semibold text-center" style={{ backgroundColor: '#7FB069', color: '#FFFFFF' }}>
                        ✓ {lang === 'hi' ? 'बुक किया गया' : 'Booked'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Booking Confirmation */}
          {isReceiptRoute && isBookingLookupComplete && !activeBooking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl border-2 p-8 text-center"
              style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1F3C88' }}>
                {lang === 'hi' ? 'बुकिंग नहीं मिली' : 'Booking not found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {lang === 'hi'
                  ? 'यह रसीद उपलब्ध नहीं है। नई परिवहन बुकिंग करें।'
                  : 'This receipt is unavailable. Please create a new transport booking.'}
              </p>
              <button
                onClick={() => router.push('/transport')}
                className="px-8 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: '#1F3C88' }}
              >
                {lang === 'hi' ? 'नई बुकिंग करें' : 'Book Transport'}
              </button>
            </motion.div>
          )}

          {step === 'confirmed' && activeBooking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 rounded-xl border-2 p-8 md:p-10 text-center"
              style={{ borderColor: '#7FB069', backgroundColor: '#FFFFFF' }}
            >
              {!isReceiptRoute && (
              <div className="mb-6 transport-no-print">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: '#7FB069' }}>
                  ✓
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#7FB069' }}>
                  {lang === 'hi' ? 'परिवहन सफलतापूर्वक बुक किया गया!' : 'Transport Booked Successfully!'}
                </h2>
                <p className="text-gray-600">
                  {lang === 'hi' ? 'आपकी बुकिंग की पुष्टि हो गई है' : 'Your booking has been confirmed'}
                </p>
              </div>
              )}

              <div id="transport-receipt" className="max-w-2xl mx-auto text-left space-y-4 rounded-lg border-2 p-6" style={{ borderColor: '#E8DCC8' }}>
                <div className="text-center border-b pb-4" style={{ borderColor: '#E8DCC8' }}>
                  <h3 className="text-2xl font-bold" style={{ color: '#1F3C88' }}>
                    KrishiKonnect Transport Receipt
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {lang === 'hi' ? 'परिवहन सेवा रसीद' : 'Transport Service Receipt'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.id}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.createdAt}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Pickup Village</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.pickupVillage}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Destination Mandi</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.destinationMandi}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Crop</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.crop}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>
                      {activeBooking.quantity} {lang === 'hi' ? 'क्विंटल' : 'quintals'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Transport Provider</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.provider}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Driver Contact</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.driverContact}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Pickup Date</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.pickupDate}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FAF3E0' }}>
                    <p className="text-sm text-gray-600 mb-1">Estimated Arrival</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>{activeBooking.estimatedArrival}</p>
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: '#E8F5E9', border: '2px solid #7FB069' }}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-gray-700">Total Cost</p>
                    <p className="font-bold text-3xl" style={{ color: '#7FB069' }}>
                      ₹{activeBooking.cost.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold" style={{ color: '#1F3C88' }}>
                      {lang === 'hi' ? 'पुष्टि की गई' : 'Confirmed'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center transport-no-print">
                <button
                  onClick={handlePrintReceipt}
                  className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#B85C38', color: '#FFFFFF' }}
                >
                  {lang === 'hi' ? 'रसीद प्रिंट करें' : 'Print Receipt'}
                </button>
                <button
                  onClick={handleBackToMandi}
                  className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: '#1F3C88', color: '#FFFFFF' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#162847'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1F3C88'
                  }}
                >
                  {lang === 'hi' ? 'मंडी भाव पर वापस जाएं' : 'Back to Mandi Prices'}
                </button>
              </div>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>

      <style jsx global>{`
        @media print {
          body.transport-receipt-print * {
            visibility: hidden;
          }

          body.transport-receipt-print #transport-receipt,
          body.transport-receipt-print #transport-receipt * {
            visibility: visible;
          }

          body.transport-receipt-print #transport-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            border: 0;
            box-shadow: none;
            background: #ffffff;
          }

          body.transport-receipt-print .transport-no-print {
            display: none !important;
          }
        }
      `}</style>
    </FeaturePageLayout>
  )
}
