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

const hasCompleteFarmerProfile = (profile: Partial<FarmerProfile>): profile is FarmerProfile => {
  return Boolean(
    profile.name &&
    profile.village &&
    profile.state &&
    profile.primaryCrop &&
    profile.phoneNumber
  )
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
        // Get profile from users/{uid}
        try {
          const userRef = doc(db, 'users', currentUser.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const profile = userSnap.data() as Partial<FarmerProfile>
            if (hasCompleteFarmerProfile(profile)) {
              setFarmerProfile(profile)
              localStorage.setItem('farmer_profile', JSON.stringify(profile))
            } else {
              setFarmerProfile(null)
              localStorage.removeItem('farmer_profile')
            }
          } else {
            setFarmerProfile(null)
            localStorage.removeItem('farmer_profile')
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
