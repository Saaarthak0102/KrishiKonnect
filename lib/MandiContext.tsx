'use client'

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import mandiPricesData from '@/data/mandiPrices.json'

interface MandiPrice {
  id: string
  crop: string
  state: string
  mandi: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  trend: {
    direction: 'up' | 'down' | 'stable'
    change: string
  }
  lastUpdated: string
}

interface MandiContextType {
  prices: MandiPrice[]
  loading: boolean
  error: string | null
  getPricesByCrop: (crop: string) => MandiPrice[]
  getPricesByState: (state: string) => MandiPrice[]
  getPricesByStateAndCrop: (state: string, crop: string) => MandiPrice[]
  getAllStates: () => string[]
  getAllCrops: () => string[]
  refreshPrices: () => void
}

const MandiContext = createContext<MandiContextType | undefined>(undefined)

export function MandiProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<MandiPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize prices with mock live updates
  const initializePrices = useCallback(() => {
    if (initialized) return

    try {
      setLoading(true)
      
      // Apply mock live price updates (±2%) to simulate real market data
      const updatedPrices = (mandiPricesData.prices as MandiPrice[]).map((price) => {
        const variation = Math.random() * 0.04 - 0.02 // ±2%
        const newModalPrice = Math.round(price.modalPrice * (1 + variation))
        const newMinPrice = Math.round(price.minPrice * (1 + variation))
        const newMaxPrice = Math.round(price.maxPrice * (1 + variation))

        // Recalculate trend
        let trend: 'up' | 'down' | 'stable' = 'stable'
        let change = '0%'

        if (variation > 0.01) {
          trend = 'up'
          change = `+${Math.abs(Math.round(variation * 100 * 10) / 10)}%`
        } else if (variation < -0.01) {
          trend = 'down'
          change = `${Math.round(Math.abs(variation) * 100 * 10) / 10}%`
        }

        return {
          ...price,
          modalPrice: newModalPrice,
          minPrice: newMinPrice,
          maxPrice: newMaxPrice,
          trend: { ...price.trend, direction: trend, change },
        }
      })

      setPrices(updatedPrices)
      setError(null)
      setInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mandi prices')
    } finally {
      setLoading(false)
    }
  }, [initialized])

  // Load prices on mount
  React.useEffect(() => {
    initializePrices()
  }, [initializePrices])

  const getPricesByCrop = useCallback(
    (crop: string) => {
      return prices.filter((p) => p.crop === crop)
    },
    [prices]
  )

  const getPricesByState = useCallback(
    (state: string) => {
      return prices.filter((p) => p.state === state)
    },
    [prices]
  )

  const getPricesByStateAndCrop = useCallback(
    (state: string, crop: string) => {
      return prices.filter((p) => p.state === state && p.crop === crop)
    },
    [prices]
  )

  const getAllStates = useCallback(() => {
    const states = new Set(prices.map((p) => p.state))
    return Array.from(states).sort()
  }, [prices])

  const getAllCrops = useCallback(() => {
    const crops = new Set(prices.map((p) => p.crop))
    return Array.from(crops).sort()
  }, [prices])

  const refreshPrices = useCallback(() => {
    setInitialized(false)
    initializePrices()
  }, [initializePrices])

  const value: MandiContextType = {
    prices,
    loading,
    error,
    getPricesByCrop,
    getPricesByState,
    getPricesByStateAndCrop,
    getAllStates,
    getAllCrops,
    refreshPrices,
  }

  return <MandiContext.Provider value={value}>{children}</MandiContext.Provider>
}

export function useMandiPrices(): MandiContextType {
  const context = useContext(MandiContext)
  if (context === undefined) {
    throw new Error('useMandiPrices must be used within MandiProvider')
  }
  return context
}
