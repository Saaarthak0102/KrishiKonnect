'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  getStarredCrops,
  starCrop,
  unstarCrop,
} from '@/lib/starredCrops'

interface StarredCropsContextType {
  starredCrops: string[]
  loading: boolean
  isStarred: (cropId: string) => boolean
  toggleStar: (cropId: string) => Promise<{
    success: boolean
    isStarred: boolean
    message?: string
  }>
  refreshStarredCrops: () => Promise<void>
}

const StarredCropsContext = createContext<StarredCropsContextType | undefined>(undefined)

export function StarredCropsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [starredCrops, setStarredCrops] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch starred crops from Firestore
  const fetchStarredCrops = useCallback(async () => {
    if (!user?.uid) {
      setStarredCrops([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const crops = await getStarredCrops(user.uid)
      setStarredCrops(crops)
    } catch (error) {
      console.error('Error fetching starred crops:', error)
      setStarredCrops([])
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchStarredCrops()
  }, [fetchStarredCrops])

  // Check if a crop is starred
  const isStarred = useCallback(
    (cropId: string) => {
      return starredCrops.includes(cropId)
    },
    [starredCrops]
  )

  // Toggle star status with optimistic UI update
  const toggleStar = useCallback(
    async (cropId: string) => {
      if (!user?.uid) {
        return {
          success: false,
          isStarred: false,
          message: 'Please login to star crops',
        }
      }

      const currentlyStarred = isStarred(cropId)

      try {
        if (currentlyStarred) {
          // Optimistically update UI before Firestore call
          setStarredCrops((prev) => prev.filter((id) => id !== cropId))

          // Unstar in Firestore
          const success = await unstarCrop(user.uid, cropId)
          
          if (!success) {
            // Rollback on failure
            setStarredCrops((prev) => [...prev, cropId])
            return {
              success: false,
              isStarred: true,
              message: 'Failed to remove crop',
            }
          }

          return {
            success: true,
            isStarred: false,
            message: 'Removed from My Crops',
          }
        } else {
          // Check limit before adding
          if (starredCrops.length >= 5) {
            return {
              success: false,
              isStarred: false,
              message: 'You can save up to 5 crops. Remove one to add another.',
            }
          }

          // Optimistically update UI before Firestore call
          setStarredCrops((prev) => [...prev, cropId])

          // Star in Firestore
          const success = await starCrop(user.uid, cropId)
          
          if (!success) {
            // Rollback on failure
            setStarredCrops((prev) => prev.filter((id) => id !== cropId))
            return {
              success: false,
              isStarred: false,
              message: 'Failed to add crop',
            }
          }

          return {
            success: true,
            isStarred: true,
            message: '⭐ Crop added to My Crops',
          }
        }
      } catch (error) {
        console.error('Error toggling star:', error)
        
        // Rollback optimistic update
        if (currentlyStarred) {
          setStarredCrops((prev) => [...prev, cropId])
        } else {
          setStarredCrops((prev) => prev.filter((id) => id !== cropId))
        }

        return {
          success: false,
          isStarred: currentlyStarred,
          message: 'An error occurred',
        }
      }
    },
    [user?.uid, starredCrops, isStarred]
  )

  return (
    <StarredCropsContext.Provider
      value={{
        starredCrops,
        loading,
        isStarred,
        toggleStar,
        refreshStarredCrops: fetchStarredCrops,
      }}
    >
      {children}
    </StarredCropsContext.Provider>
  )
}

export function useStarredCropsContext() {
  const context = useContext(StarredCropsContext)
  if (context === undefined) {
    throw new Error('useStarredCropsContext must be used within a StarredCropsProvider')
  }
  return context
}
