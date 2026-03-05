'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  getStarredCrops,
  starCrop,
  unstarCrop,
  isCropStarred,
} from '@/lib/starredCrops'

interface UseStarredCropsReturn {
  starredCrops: string[]
  loading: boolean
  isStarred: (cropId: string) => boolean
  toggleStar: (cropId: string) => Promise<{
    success: boolean
    isStarred: boolean
    message?: string
  }>
}

export function useStarredCrops(): UseStarredCropsReturn {
  const { user } = useAuth()
  const [starredCrops, setStarredCrops] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch starred crops on mount and when user changes
  useEffect(() => {
    if (!user?.uid) {
      setStarredCrops([])
      setLoading(false)
      return
    }

    const fetchStarredCrops = async () => {
      setLoading(true)
      const crops = await getStarredCrops(user.uid)
      setStarredCrops(crops)
      setLoading(false)
    }

    fetchStarredCrops()
  }, [user?.uid])

  const isStarred = useCallback(
    (cropId: string) => {
      return starredCrops.includes(cropId)
    },
    [starredCrops]
  )

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
          // Unstar
          const success = await unstarCrop(user.uid, cropId)
          if (success) {
            setStarredCrops((prev) => prev.filter((id) => id !== cropId))
          }
          return {
            success,
            isStarred: false,
            message: success ? 'Removed from My Crops' : 'Failed to remove crop',
          }
        } else {
          // Star
          if (starredCrops.length >= 5) {
            return {
              success: false,
              isStarred: false,
              message: 'You can save up to 5 crops. Remove one to add another.',
            }
          }

          const success = await starCrop(user.uid, cropId)
          if (success) {
            setStarredCrops((prev) => [...prev, cropId])
          }
          return {
            success,
            isStarred: true,
            message: success ? '⭐ Crop added to My Crops' : 'Failed to add crop',
          }
        }
      } catch (error) {
        console.error('Error toggling star:', error)
        return {
          success: false,
          isStarred: currentlyStarred,
          message: 'An error occurred',
        }
      }
    },
    [user?.uid, starredCrops, isStarred]
  )

  return {
    starredCrops,
    loading,
    isStarred,
    toggleStar,
  }
}
