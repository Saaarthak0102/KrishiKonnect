'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { TransportBookingRecord } from '@/lib/transportBookings'

interface TransportBookingHistoryProps {
  bookings: TransportBookingRecord[]
  lang: 'en' | 'hi'
}

const translations = {
  hi: {
    yourTransportBookings: 'आपकी परिवहन बुकिंग',
    noBookings: 'अभी तक कोई परिवहन बुकिंग नहीं है। मंडी से परिवहन बुक करें।',
    crop: 'फसल',
    destination: 'गंतव्य',
    pickup: 'पिकअप',
    provider: 'प्रदाता',
    cost: 'लागत',
    status: 'स्थिति',
    confirmed: 'पुष्टि की गई',
    viewReceipt: 'रसीद देखें',
    printReceipt: 'प्रिंट करें',
    requestNewTransport: 'नई परिवहन बुक करें'
  },
  en: {
    yourTransportBookings: 'Your Transport Bookings',
    noBookings: 'No transport bookings yet. Book transport from mandi flow.',
    crop: 'Crop',
    destination: 'Destination',
    pickup: 'Pickup',
    provider: 'Provider',
    cost: 'Cost',
    status: 'Status',
    confirmed: 'Confirmed',
    viewReceipt: 'View Receipt',
    printReceipt: 'Print',
    requestNewTransport: 'Request New Transport'
  }
}

export default function TransportBookingHistory({
  bookings,
  lang = 'en'
}: TransportBookingHistoryProps) {
  const router = useRouter()
  const t = translations[lang]

  const sortedBookings = useMemo(() => {
    return [...bookings]
      .filter((booking) => booking.type === 'transport')
      .sort((a, b) => {
        // Parse dates for comparison
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
  }, [bookings])

  const handleViewReceipt = (bookingId: string) => {
    router.push(`/transport?bookingId=${bookingId}`)
  }

  if (sortedBookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 rounded-xl border-2 p-8 text-center"
        style={{ borderColor: '#E8DCC8', backgroundColor: '#FAF3E0' }}
      >
        <p className="text-gray-600 mb-6">{t.noBookings}</p>
        <button
          onClick={() => router.push('/mandi')}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#1F3C88' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#162847'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1F3C88'
          }}
        >
          {lang === 'hi' ? 'मंडी से बुक करें' : 'Book from Mandi'}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-12 rounded-xl border-2 p-8"
      style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
    >
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#1F3C88' }}>
        📋 {t.yourTransportBookings}
      </h2>

      <div className="space-y-4">
        {sortedBookings.map((booking, idx) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="rounded-lg border-2 p-6 transition-all hover:shadow-md"
            style={{ borderColor: '#E8DCC8', backgroundColor: '#FAF3E0' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Crop → Destination */}
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                  {t.crop} → {t.destination}
                </p>
                <p className="font-semibold" style={{ color: '#1F3C88' }}>
                  {booking.crop} → {booking.destinationMandi}
                </p>
              </div>

              {/* Pickup Village */}
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                  {t.pickup}
                </p>
                <p className="font-semibold" style={{ color: '#1F3C88' }}>
                  {booking.pickupVillage}
                </p>
              </div>

              {/* Pickup Date */}
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                  {lang === 'hi' ? 'पिकअप तारीख' : 'Pickup Date'}
                </p>
                <p className="font-semibold" style={{ color: '#1F3C88' }}>
                  {booking.pickupDate}
                </p>
              </div>

              {/* Provider */}
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                  {t.provider}
                </p>
                <p className="font-semibold" style={{ color: '#1F3C88' }}>
                  {booking.provider}
                </p>
              </div>

              {/* Cost */}
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
                  {t.cost}
                </p>
                <p className="font-bold text-lg" style={{ color: '#7FB069' }}>
                  ₹{booking.cost.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#D8CFC0' }}>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: '#E8F5E9', color: '#7FB069' }}
                >
                  ✓ {t.confirmed}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewReceipt(booking.id)}
                  className="px-4 py-2 rounded-lg font-semibold text-white transition-all text-sm hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#1F3C88' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#162847'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1F3C88'
                  }}
                >
                  {t.viewReceipt}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
