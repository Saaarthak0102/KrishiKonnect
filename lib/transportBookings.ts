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
  getDoc,
  deleteDoc
} from 'firebase/firestore'

export const TRANSPORT_BOOKINGS_STORAGE_KEY = 'transportBooking'

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
 * Get the current transport booking from localStorage
 * Returns a single booking or null (only one booking per user)
 */
export function getTransportBooking(): TransportBookingRecord | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(TRANSPORT_BOOKINGS_STORAGE_KEY)
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored)
    return parsed as TransportBookingRecord
  } catch {
    return null
  }
}

/**
 * Legacy function for backward compatibility
 * Returns array with single booking or empty array
 */
export function getTransportBookings(): TransportBookingRecord[] {
  const booking = getTransportBooking()
  return booking ? [booking] : []
}

/**
 * Save booking to both localStorage (instant) and Firestore (persistent)
 * Uses user.uid as document ID to ensure only one booking per user
 * Automatically replaces any previous booking
 * Returns the booking record
 */
export async function saveTransportBooking(
  booking: TransportBookingRecord,
  userId?: string
): Promise<TransportBookingRecord> {
  // Save to localStorage for instant UI update (single booking, not array)
  localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(booking))

  // Save to Firestore if userId is provided
  // Using setDoc with user.uid as document ID automatically overwrites previous booking
  if (userId) {
    try {
      const bookingRef = doc(db, 'bookings', userId)
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
  const booking = getTransportBooking()
  return booking && booking.id === bookingId ? booking : null
}

/**
 * Load transport booking from Firestore for a specific user
 * Returns the single booking document for the user
 */
export async function loadTransportBookingsFromFirestore(
  userId: string
): Promise<TransportBookingRecord[]> {
  if (!userId) {
    return []
  }

  try {
    const bookingRef = doc(db, 'bookings', userId)
    const docSnap = await getDoc(bookingRef)

    if (!docSnap.exists()) {
      return []
    }

    const data = docSnap.data()
    const booking: TransportBookingRecord = {
      id: data.id,
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

    // Update localStorage with fetched data (single booking)
    localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(booking))

    return [booking]
  } catch (error) {
    console.error('Error loading booking from Firestore:', error)
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
    const bookingRef = doc(db, 'bookings', userId)
    const docSnap = await getDoc(bookingRef)

    if (!docSnap.exists()) {
      return getTransportBookingById(bookingId)
    }

    const data = docSnap.data()
    
    // Verify this is the booking we're looking for
    if (data.id !== bookingId) {
      return null
    }

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

/**
 * Delete the current booking for a user
 * Used when user wants to cancel their booking
 */
export async function deleteTransportBooking(userId?: string): Promise<void> {
  // Remove from localStorage
  localStorage.removeItem(TRANSPORT_BOOKINGS_STORAGE_KEY)

  // Remove from Firestore if userId is provided
  if (userId) {
    try {
      const bookingRef = doc(db, 'bookings', userId)
      await deleteDoc(bookingRef)
    } catch (error) {
      console.error('Error deleting booking from Firestore:', error)
    }
  }
}
