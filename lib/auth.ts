'use client'

import { auth, db } from './firebase'
import {
  ConfirmationResult,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

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
  phoneNumber: string
): Promise<boolean> => {
  try {
    const farmerRef = doc(db, 'farmers', phoneNumber)
    const farmerSnap = await getDoc(farmerRef)
    return farmerSnap.exists()
  } catch (error) {
    console.error('Error checking farmer profile:', error)
    throw error
  }
}

// Get farmer profile
export const getFarmerProfile = async (phoneNumber: string) => {
  try {
    const farmerRef = doc(db, 'farmers', phoneNumber)
    const farmerSnap = await getDoc(farmerRef)
    if (farmerSnap.exists()) {
      return farmerSnap.data()
    }
    return null
  } catch (error) {
    console.error('Error getting farmer profile:', error)
    throw error
  }
}

// Create farmer profile
export const createFarmerProfile = async (
  phoneNumber: string,
  profileData: {
    name: string
    village: string
    state: string
    primaryCrop: string
  }
) => {
  try {
    const farmerRef = doc(db, 'farmers', phoneNumber)
    await setDoc(farmerRef, {
      ...profileData,
      phoneNumber,
      createdAt: serverTimestamp(),
    })
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
