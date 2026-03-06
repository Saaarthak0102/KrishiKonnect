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
 * Get all transport bookings from localStorage
 * Returns array of bookings (multiple bookings per user supported)
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
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Get the latest transport booking from localStorage
 * Returns the most recent booking or null
 */
export function getLatestTransportBooking(): TransportBookingRecord | null {
  const bookings = getTransportBookings()
  if (bookings.length === 0) return null
  
  // Sort by createdAt descending and return the first (newest) one
  const sorted = [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })
  
  return sorted[0]
}

/**
 * Save booking to both localStorage (instant) and Firestore (persistent)
 * Supports multiple bookings per user
 * Uses addDoc() for Firestore to create separate documents for each booking
 * Returns the booking record with firestoreId if saved to Firestore
 */
export async function saveTransportBooking(
  booking: TransportBookingRecord,
  userId?: string
): Promise<TransportBookingRecord> {
  // Get existing bookings and add the new one
  let bookingWithId = booking
  
  if (userId) {
    try {
      // Save to Firestore using addDoc to create a new document (allows multiple bookings)
      const bookingsCollection = collection(db, 'bookings')
      const docRef = await addDoc(bookingsCollection, {
        userId,
        ...booking,
        createdAtTimestamp: new Date(booking.createdAt),
        savedAt: new Date()
      })
      bookingWithId = {
        ...booking,
        firestoreId: docRef.id
      }
    } catch (error) {
      console.error('Error saving booking to Firestore:', error)
      // Continue anyway - localStorage fallback is active
    }
  }

  // Save to localStorage - store as array of bookings
  const existingBookings = getTransportBookings()
  const updatedBookings = [bookingWithId, ...existingBookings]
  localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings))

  return bookingWithId
}

/**
 * Get transport booking by ID from localStorage
 */
export function getTransportBookingById(bookingId: string): TransportBookingRecord | null {
  const bookings = getTransportBookings()
  const booking = bookings.find(b => b.id === bookingId)
  return booking || null
}

/**
 * Load all transport bookings from Firestore for a specific user
 * Queries all booking documents where userId matches
 * Returns array of bookings sorted by newest first
 */
export async function loadTransportBookingsFromFirestore(
  userId: string
): Promise<TransportBookingRecord[]> {
  if (!userId) {
    return []
  }

  try {
    const bookingsCollection = collection(db, 'bookings')
    const q = query(
      bookingsCollection,
      where('userId', '==', userId),
      orderBy('createdAtTimestamp', 'desc')
    )
    const querySnapshot = await getDocs(q)

    const bookings: TransportBookingRecord[] = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
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
        firestoreId: doc.id
      }
      bookings.push(booking)
    })

    // Update localStorage with fetched bookings (preserving array)
    localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings))

    return bookings
  } catch (error) {
    console.error('Error loading bookings from Firestore:', error)
    return getTransportBookings() // Fallback to localStorage
  }
}

/**
 * Get a specific booking from Firestore by booking ID
 */
export async function getTransportBookingFromFirestore(
  userId: string,
  bookingId: string
): Promise<TransportBookingRecord | null> {
  if (!userId || !bookingId) {
    return getTransportBookingById(bookingId)
  }

  try {
    // Load all user bookings and find the one with matching bookingId
    const bookingsCollection = collection(db, 'bookings')
    const q = query(
      bookingsCollection,
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)

    let foundBooking: TransportBookingRecord | null = null
    querySnapshot.forEach(doc => {
      const data = doc.data()
      if (data.id === bookingId) {
        foundBooking = {
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
          firestoreId: doc.id
        }
      }
    })

    return foundBooking || getTransportBookingById(bookingId)
  } catch (error) {
    console.error('Error getting booking from Firestore:', error)
    return getTransportBookingById(bookingId)
  }
}

/**
 * Delete a specific booking by ID from localStorage and Firestore
 * If firestoreId is provided, deletes from Firestore
 */
export async function deleteTransportBooking(bookingId: string, firestoreId?: string): Promise<void> {
  // Remove from localStorage
  const existingBookings = getTransportBookings()
  const updatedBookings = existingBookings.filter(b => b.id !== bookingId)
  localStorage.setItem(TRANSPORT_BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings))

  // Remove from Firestore if firestoreId is provided
  if (firestoreId) {
    try {
      const bookingRef = doc(db, 'bookings', firestoreId)
      await deleteDoc(bookingRef)
    } catch (error) {
      console.error('Error deleting booking from Firestore:', error)
    }
  }
}
