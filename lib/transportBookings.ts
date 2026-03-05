import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  setDoc,
  doc,
  getDoc
} from 'firebase/firestore'

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
  firestoreId?: string
}

export function generateBookingId() {
  return `TR-${Math.floor(10000 + Math.random() * 90000)}`
}

/**
 * Get transport bookings from localStorage (fast, instant load)
 */
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

/**
 * Save booking to both localStorage (instant) and Firestore (persistent)
 * Returns the booking record
 */
export async function saveTransportBooking(
  booking: TransportBookingRecord,
  userId?: string
): Promise<TransportBookingRecord> {
  // Always save to localStorage for instant UI update
  const existingBookings = getTransportBookings()
  const updatedBookings = [booking, ...existingBookings]
  localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings))

  // Save to Firestore if userId is provided
  if (userId) {
    try {
      const bookingRef = doc(db, 'users', userId, 'transportBookings', booking.id)
      await setDoc(bookingRef, {
        ...booking,
        createdAtTimestamp: new Date(booking.createdAt),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error saving booking to Firestore:', error)
      // Continue anyway - localStorage fallback is active
    }
  }

  return booking
}

/**
 * Get transport booking by ID from localStorage
 */
export function getTransportBookingById(bookingId: string): TransportBookingRecord | null {
  return getTransportBookings().find((booking) => booking.id === bookingId) || null
}

/**
 * Load transport bookings from Firestore for a specific user
 * This is called in background to sync latest data
 */
export async function loadTransportBookingsFromFirestore(
  userId: string
): Promise<TransportBookingRecord[]> {
  if (!userId) {
    return []
  }

  try {
    const bookingsRef = collection(db, 'users', userId, 'transportBookings')
    const q = query(bookingsRef, orderBy('createdAtTimestamp', 'desc'))
    const snapshot = await getDocs(q)

    const bookings: TransportBookingRecord[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: data.id || docSnap.id,
        type: 'transport',
        crop: data.crop,
        quantity: data.quantity,
        pickupVillage: data.pickupVillage,
        destinationMandi: data.destinationMandi,
        provider: data.provider,
        driverContact: data.driverContact,
        pickupDate: data.pickupDate,
        estimatedArrival: data.estimatedArrival,
        cost: data.cost,
        status: 'confirmed',
        createdAt: data.createdAt,
        firestoreId: docSnap.id
      }
    })

    // Update localStorage with fetched data
    localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings))

    return bookings
  } catch (error) {
    console.error('Error loading bookings from Firestore:', error)
    return getTransportBookings() // Fallback to localStorage
  }
}

/**
 * Get a specific booking from Firestore
 */
export async function getTransportBookingFromFirestore(
  userId: string,
  bookingId: string
): Promise<TransportBookingRecord | null> {
  if (!userId || !bookingId) {
    return getTransportBookingById(bookingId)
  }

  try {
    const bookingRef = doc(db, 'users', userId, 'transportBookings', bookingId)
    const docSnap = await getDoc(bookingRef)

    if (!docSnap.exists()) {
      return getTransportBookingById(bookingId)
    }

    const data = docSnap.data()
    return {
      id: data.id || bookingId,
      type: 'transport',
      crop: data.crop,
      quantity: data.quantity,
      pickupVillage: data.pickupVillage,
      destinationMandi: data.destinationMandi,
      provider: data.provider,
      driverContact: data.driverContact,
      pickupDate: data.pickupDate,
      estimatedArrival: data.estimatedArrival,
      cost: data.cost,
      status: 'confirmed',
      createdAt: data.createdAt,
      firestoreId: docSnap.id
    }
  } catch (error) {
    console.error('Error getting booking from Firestore:', error)
    return getTransportBookingById(bookingId)
  }
}
