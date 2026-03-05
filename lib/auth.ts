'use client'

import { auth, db } from './firebase'
import {
  ConfirmationResult,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

type FarmerProfileData = {
  name?: string
  phoneNumber?: string
  village?: string
  state?: string
  primaryCrop?: string
}

const hasCompleteFarmerProfile = (data: FarmerProfileData): boolean => {
  return Boolean(
    data.name &&
    data.phoneNumber &&
    data.village &&
    data.state &&
    data.primaryCrop
  )
}

/**
 * NOTE: reCAPTCHA initialization and phone authentication is now handled directly in login/page.tsx
 * to ensure a single RecaptchaVerifier instance is maintained throughout the login flow.
 * This prevents reCAPTCHA challenges from appearing during development.
 */

// Verify OTP
export const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string) => {
  try {
    const userCredential = await confirmationResult.confirm(otp)
    return userCredential.user
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw error
  }
}

// Check if farmer profile exists
export const checkFarmerProfile = async (
  uid: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return false
    }

    return hasCompleteFarmerProfile(userSnap.data() as FarmerProfileData)
  } catch (error) {
    console.error('Error checking farmer profile:', error)
    throw error
  }
}

// Get farmer profile
export const getFarmerProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      const profile = userSnap.data() as FarmerProfileData
      if (hasCompleteFarmerProfile(profile)) {
        return profile
      }
    }
    return null
  } catch (error) {
    console.error('Error getting farmer profile:', error)
    throw error
  }
}

// Create farmer profile
export const createFarmerProfile = async (
  uid: string,
  profileData: {
    name: string
    phoneNumber: string
    village: string
    state: string
    primaryCrop: string
  }
) => {
  try {
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, {
      ...profileData,
      createdAt: serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    console.error('Error creating farmer profile:', error)
    throw error
  }
}

// Logout user
export const logout = async () => {
  try {
    await auth.signOut()
    localStorage.removeItem('farmer_profile')
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}
