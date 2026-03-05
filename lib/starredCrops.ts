import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'

const COLLECTION_NAME = 'users'
const FIELD_NAME = 'starredCrops'
const MAX_STARRED_CROPS = 5

/**
 * Get all starred crop IDs for a user
 */
export async function getStarredCrops(userId: string): Promise<string[]> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const starredCrops = userSnap.data()[FIELD_NAME]
      return Array.isArray(starredCrops) ? starredCrops : []
    }

    return []
  } catch (error) {
    console.error('Error fetching starred crops:', error)
    return []
  }
}

/**
 * Check if a crop is starred for a user
 */
export async function isCropStarred(
  userId: string,
  cropId: string
): Promise<boolean> {
  try {
    const starredCrops = await getStarredCrops(userId)
    return starredCrops.includes(cropId)
  } catch (error) {
    console.error('Error checking if crop is starred:', error)
    return false
  }
}

/**
 * Star a crop for a user (max 5 crops)
 * Returns true if successful, false if limit exceeded
 */
export async function starCrop(
  userId: string,
  cropId: string
): Promise<boolean> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId)
    const userSnap = await getDoc(userRef)

    const currentStarred = userSnap.exists()
      ? (userSnap.data()[FIELD_NAME] || [])
      : []

    // Check if crop is already starred
    if (currentStarred.includes(cropId)) {
      return true
    }

    // Check if limit exceeded
    if (currentStarred.length >= MAX_STARRED_CROPS) {
      return false
    }

    // Add crop to starred list
    if (!userSnap.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        [FIELD_NAME]: [cropId],
      })
    } else {
      await updateDoc(userRef, {
        [FIELD_NAME]: arrayUnion(cropId),
      })
    }

    return true
  } catch (error) {
    console.error('Error starring crop:', error)
    return false
  }
}

/**
 * Unstar a crop for a user
 */
export async function unstarCrop(
  userId: string,
  cropId: string
): Promise<boolean> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return false
    }

    await updateDoc(userRef, {
      [FIELD_NAME]: arrayRemove(cropId),
    })

    return true
  } catch (error) {
    console.error('Error unstarring crop:', error)
    return false
  }
}

/**
 * Get the count of starred crops for a user
 */
export async function getStarredCropsCount(userId: string): Promise<number> {
  try {
    const starredCrops = await getStarredCrops(userId)
    return starredCrops.length
  } catch (error) {
    console.error('Error getting starred crops count:', error)
    return 0
  }
}

/**
 * Check if user can star more crops
 */
export async function canStarMore(userId: string): Promise<boolean> {
  try {
    const count = await getStarredCropsCount(userId)
    return count < MAX_STARRED_CROPS
  } catch (error) {
    console.error('Error checking if can star more:', error)
    return true
  }
}
