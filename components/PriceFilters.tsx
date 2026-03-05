'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { getAllStates, getDistrictsByState } from '@/lib/mandiService'

interface PriceFiltersProps {
  crops: any[]
  selectedCrop: string
  selectedState: string
  selectedDistrict: string
  onCropChange: (cropId: string) => void
  onStateChange: (state: string) => void
  onDistrictChange: (district: string) => void
  onSearchChange: (search: string) => void
  searchTerm: string
}

export default function PriceFilters({
  crops,
  selectedCrop,
  selectedState,
  selectedDistrict,
  onCropChange,
  onStateChange,
  onDistrictChange,
  onSearchChange,
  searchTerm,
}: PriceFiltersProps) {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [loadingStates, setLoadingStates] = useState(true)

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const stateList = await getAllStates()
        setStates(stateList)
      } catch (error) {
        console.error('Error loading states:', error)
      } finally {
        setLoadingStates(false)
      }
    }
    loadStates()
  }, [])

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      const loadDistricts = async () => {
        try {
          const districtList = await getDistrictsByState(selectedState)
          setDistricts(districtList)
        } catch (error) {
          console.error('Error loading districts:', error)
          setDistricts([])
        }
      }
      loadDistricts()
    } else {
      setDistricts([])
    }
  }, [selectedState])

  // Filter crops based on search
  const filteredCrops = useMemo(() => {
    if (!searchTerm) return crops
    const term = searchTerm.toLowerCase()
    return crops.filter((crop) => {
      const nameEn = crop.name_en?.toLowerCase() || ''
      const nameHi = crop.name_hi?.toLowerCase() || ''
      return nameEn.includes(term) || nameHi.includes(term)
    })
  }, [searchTerm, crops])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-krishi-border bg-white p-6 shadow-sm"
    >
      <h3 className="font-bold text-krishi-heading mb-6">
        {lang === 'hi' ? '🔍 फिल्टर और खोज' : '🔍 Filters & Search'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Crop Search */}
        <div>
          <label className="block text-sm font-semibold text-krishi-text mb-2">
            {lang === 'hi' ? 'फसल खोजें' : 'Search Crop'}
          </label>
          <input
            type="text"
            placeholder={t.searchCrop}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary transition-colors bg-white text-krishi-text placeholder-krishi-text/50"
          />
        </div>

        {/* Crop Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-krishi-text mb-2">
            {lang === 'hi' ? 'फसल चुनें' : 'Select Crop'}
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => onCropChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary transition-colors bg-white text-krishi-text appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D1D1D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '20px',
              paddingRight: '32px',
            }}
          >
            <option value="">{lang === 'hi' ? 'सभी फसलें' : 'All Crops'}</option>
            {filteredCrops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {lang === 'hi' ? crop.name_hi : crop.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* State Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-krishi-text mb-2">
            {lang === 'hi' ? 'राज्य चुनें' : 'Select State'}
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              onStateChange(e.target.value)
              onDistrictChange('')
            }}
            disabled={loadingStates}
            className="w-full px-3 py-2 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary transition-colors bg-white text-krishi-text appearance-none cursor-pointer disabled:bg-krishi-bg disabled:cursor-not-allowed"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D1D1D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '20px',
              paddingRight: '32px',
            }}
          >
            <option value="">{lang === 'hi' ? 'सभी राज्य' : 'All States'}</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-krishi-text mb-2">
            {lang === 'hi' ? 'जिला चुनें' : 'Select District'}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={!selectedState}
            className="w-full px-3 py-2 border-2 border-krishi-border rounded-lg focus:outline-none focus:border-krishi-primary transition-colors bg-white text-krishi-text appearance-none cursor-pointer disabled:bg-krishi-bg disabled:cursor-not-allowed"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D1D1D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '20px',
              paddingRight: '32px',
            }}
          >
            <option value="">{lang === 'hi' ? 'सभी जिले' : 'All Districts'}</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCrop || selectedState || selectedDistrict) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCrop && (
            <button
              onClick={() => onCropChange('')}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-krishi-primary/10 text-krishi-primary text-sm font-medium hover:bg-krishi-primary/20 transition-colors"
            >
              {filteredCrops.find((c) => c.id === selectedCrop)?.[
                lang === 'hi' ? 'name_hi' : 'name_en'
              ]}
              <span>×</span>
            </button>
          )}
          {selectedState && (
            <button
              onClick={() => {
                onStateChange('')
                onDistrictChange('')
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-krishi-primary/10 text-krishi-primary text-sm font-medium hover:bg-krishi-primary/20 transition-colors"
            >
              {selectedState}
              <span>×</span>
            </button>
          )}
          {selectedDistrict && (
            <button
              onClick={() => onDistrictChange('')}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-krishi-primary/10 text-krishi-primary text-sm font-medium hover:bg-krishi-primary/20 transition-colors"
            >
              {selectedDistrict}
              <span>×</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
