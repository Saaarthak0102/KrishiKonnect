'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { TransportBookingRecord } from '@/lib/transportBookings'
import { FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi'
import { FaTruck } from 'react-icons/fa'

interface TransportBookingHistoryProps {
  bookings: TransportBookingRecord[]
    loading?: boolean
  lang: 'en' | 'hi'
}

const translations = {
  hi: {
    yourTransportBookings: 'आपकी वर्तमान परिवहन बुकिंग',
    noBookings: 'अभी तक कोई सक्रिय सेवा बुकिंग नहीं है। मंडी से परिवहन बुक करें।',
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
    yourTransportBookings: 'Your Current Booking',
    noBookings: 'No active service bookings yet. Book transport from mandi flow.',
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
    loading = false,
  lang = 'en'
}: TransportBookingHistoryProps) {
  const router = useRouter()
  const t = translations[lang]
  const bookingCardsRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    if (!bookingCardsRef.current || sortedBookings.length === 0) {
      return
    }

    const cards = Array.from(
      bookingCardsRef.current.querySelectorAll<HTMLElement>('.transport-booking-card')
    )

    if (cards.length === 0) {
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      cards.forEach((card) => card.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [sortedBookings])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 rounded-xl p-8 text-center"
        style={{ 
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(196,106,61,0.25)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 14px rgba(45,42,110,0.08)',
          padding: '24px'
        }}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4" 
               style={{ borderColor: '#C46A3D', borderTopColor: 'transparent' }}>
          </div>
          <p style={{ color: 'rgba(45,42,110,0.75)' }}>
            {lang === 'hi' ? 'बुकिंग लोड हो रही हैं...' : 'Loading bookings...'}
          </p>
        </div>
      </motion.div>
    )
  }

  if (sortedBookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 rounded-xl p-8 text-center"
        style={{ 
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(196,106,61,0.25)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 14px rgba(45,42,110,0.08)',
          padding: '24px'
        }}
      >
        <p className="mb-6" style={{ color: 'rgba(45,42,110,0.75)' }}>{t.noBookings}</p>
        <motion.button
          onClick={() => router.push('/mandi')}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-all"
          style={{ 
            background: '#2D2A6E',
            color: 'white',
            borderRadius: '10px',
            padding: '8px 16px',
            fontWeight: 500
          }}
          whileHover={{ 
            scale: 1.03,
            y: -2,
            boxShadow: '0 8px 18px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.12)'
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {lang === 'hi' ? 'मंडी से बुक करें' : 'Book from Mandi'}
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
      className="mb-12 rounded-xl p-8"
      style={{ 
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(196,106,61,0.25)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 0 14px rgba(45,42,110,0.08)',
        padding: '24px'
      }}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ 
        fontFamily: 'Poppins, sans-serif',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#2D2A6E'
      }}>
        <motion.span
          whileHover={{ y: -1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <FiCalendar size={20} style={{ color: '#2D2A6E', opacity: 0.85 }} />
        </motion.span>
        {t.yourTransportBookings}
      </h2>

      <div ref={bookingCardsRef} className="space-y-4 transport-booking-grid">
        {sortedBookings.map((booking, idx) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 + idx * 0.04, duration: 0.35, ease: 'easeOut' }}
            whileHover={{
              y: -4,
              scale: 1.01,
              boxShadow: '0 12px 30px rgba(0,0,0,0.10), 0 0 14px rgba(45,42,110,0.08)',
              borderColor: 'rgba(196,106,61,0.35)',
            }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg p-6 transition-all transport-booking-card group"
            style={{ 
              background: 'rgba(255,255,255,0.45)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(196,106,61,0.30)',
              borderRadius: '14px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
              transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out',
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              transitionDelay: `${0.03 + idx * 0.04}s`
            }}
            
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Crop → Destination */}
              <div className="transport-booking-row">
                <p className="text-xs mb-1 uppercase font-semibold flex items-center gap-1" style={{
                  fontSize: '0.8rem',
                  color: 'rgba(45,42,110,0.65)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  <FiMapPin
                    size={14}
                    className="transport-card-icon"
                    style={{ transition: 'transform 0.2s ease-out' }}
                  />
                  {t.crop} → {t.destination}
                </p>
                <p className="font-semibold" style={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#2D2A6E',
                  marginTop: '2px'
                }}>
                  {booking.crop} → <span style={{ color: '#C46A3D', fontWeight: 600 }}>{booking.destinationMandi}</span>
                </p>
              </div>

              {/* Pickup Village */}
              <div className="transport-booking-row">
                <p className="text-xs mb-1 uppercase font-semibold" style={{
                  fontSize: '0.8rem',
                  color: 'rgba(45,42,110,0.65)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  <FiMapPin
                    size={14}
                    className="transport-card-icon inline mr-1"
                    style={{ transition: 'transform 0.2s ease-out' }}
                  />
                  {t.pickup}
                </p>
                <p className="font-semibold" style={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#2D2A6E',
                  marginTop: '2px'
                }}>
                  {booking.pickupVillage}
                </p>
              </div>

              {/* Pickup Date */}
              <div className="transport-booking-row">
                <p className="text-xs mb-1 uppercase font-semibold" style={{
                  fontSize: '0.8rem',
                  color: 'rgba(45,42,110,0.65)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  <FiCalendar
                    size={14}
                    className="transport-card-icon inline mr-1"
                    style={{ transition: 'transform 0.2s ease-out' }}
                  />
                  {lang === 'hi' ? 'पिकअप तारीख' : 'Pickup Date'}
                </p>
                <p className="font-semibold" style={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#2D2A6E',
                  marginTop: '2px'
                }}>
                  {booking.pickupDate}
                </p>
              </div>

              {/* Provider */}
              <div className="transport-booking-row">
                <p className="text-xs mb-1 uppercase font-semibold flex items-center gap-1" style={{
                  fontSize: '0.8rem',
                  color: 'rgba(45,42,110,0.65)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  <FaTruck
                    size={14}
                    className="transport-card-icon"
                    style={{ transition: 'transform 0.2s ease-out' }}
                  />
                  {t.provider}
                </p>
                <p className="font-semibold" style={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#2D2A6E',
                  marginTop: '2px'
                }}>
                  {booking.provider}
                </p>
              </div>

              {/* Cost */}
              <div className="transport-booking-row">
                <p className="text-xs mb-1 uppercase font-semibold" style={{
                  fontSize: '0.8rem',
                  color: 'rgba(45,42,110,0.65)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  {t.cost}
                </p>
                <p className="font-bold" style={{ 
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#2E9D57'
                }}>
                  ₹{booking.cost.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#D8CFC0' }}>
              <div className="flex items-center gap-2">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{ 
                    background: 'rgba(46,157,87,0.12)',
                    color: '#2E9D57',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    animation: 'badgeGlow 2.8s infinite',
                    willChange: 'transform'
                  }}
                >
                  <FiCheckCircle
                    size={12}
                    className="transport-card-icon"
                    style={{ transition: 'transform 0.2s ease-out' }}
                  />
                  {t.confirmed}
                </motion.span>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => handleViewReceipt(booking.id)}
                  className="px-4 py-2 rounded-lg font-semibold text-white transition-all text-sm"
                  style={{ 
                    background: '#2D2A6E',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontWeight: 500
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    y: -2,
                    boxShadow: '0 8px 18px rgba(45,42,110,0.25), 0 0 10px rgba(45,42,110,0.12)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {t.viewReceipt}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
