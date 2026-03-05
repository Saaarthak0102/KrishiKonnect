export const TRANSPORT_BOOKINGS_STORAGE_KEY = 'transportBookings'

export interface TransportBookingRecord {
  id: string
  type: 'transport'
  crop: string
  quantity: number
  pickupVillage: string
  destinationMandi: string
  provider: string
  driverContact: string
  pickupDate: string
  estimatedArrival: string
  cost: number
  status: 'confirmed'
  createdAt: string
}

export function generateBookingId() {
  return `TR-${Math.floor(10000 + Math.random() * 90000)}`
}

export function getTransportBookings(): TransportBookingRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(TRANSPORT_BOOKINGS_STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as TransportBookingRecord[]
  } catch {
    return []
  }
}

export function saveTransportBooking(booking: TransportBookingRecord): TransportBookingRecord[] {
  const existingBookings = getTransportBookings()
  const updatedBookings = [booking, ...existingBookings]

  localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings))

  return updatedBookings
}

export function getTransportBookingById(bookingId: string) {
  return getTransportBookings().find((booking) => booking.id === bookingId) || null
}
