'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { auth, db } from '@/lib/firebase'
import { User, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface FarmerProfile {
  name: string
  village: string
  state: string
  primaryCrop: string
  phoneNumber: string
  createdAt?: any
}

interface AuthContextType {
  user: User | null
  farmerProfile: FarmerProfile | null
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser)

      if (currentUser) {
        // Get farmer profile from Firestore
        try {
          const farmerRef = doc(db, 'farmers', currentUser.phoneNumber || '')
          const farmerSnap = await getDoc(farmerRef)
          if (farmerSnap.exists()) {
            const profile = farmerSnap.data() as FarmerProfile
            setFarmerProfile(profile)
            localStorage.setItem('farmer_profile', JSON.stringify(profile))
          }
        } catch (error) {
          console.error('Error fetching farmer profile:', error)
        }
      } else {
        setFarmerProfile(null)
        localStorage.removeItem('farmer_profile')
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    farmerProfile,
    loading,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
