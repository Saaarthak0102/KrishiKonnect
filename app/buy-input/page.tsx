'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Footer from '@/components/Footer'
import { cropFertilizerData } from '@/data/fertilizers'

function toTitle(text: string) {
  return text
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function BuyInputPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const crop = (searchParams.get('crop') || '').toLowerCase()
  const itemSlug = (searchParams.get('item') || '').toLowerCase()

  const itemsForCrop = useMemo(() => cropFertilizerData[crop] ?? [], [crop])
  const initialItem = useMemo(
    () => itemsForCrop.find((entry) => entry.name.toLowerCase().replace(/\s+/g, '-') === itemSlug),
    [itemsForCrop, itemSlug]
  )

  const [itemName, setItemName] = useState(initialItem?.name || '')
  const [quantity, setQuantity] = useState('1')
  const [address, setAddress] = useState('')
  const [mobile, setMobile] = useState('')

  const selectedItem = itemsForCrop.find((entry) => entry.name === itemName) || initialItem

  const handleProceed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedItem) return

    const quantityValue = Math.max(1, Number(quantity) || 1)
    const params = new URLSearchParams({
      crop,
      item: selectedItem.name,
      quantity: String(quantityValue),
      unit: selectedItem.unit,
      itemPrice: String(selectedItem.price),
      address,
      mobile,
    })

    router.push(`/buy-summary?${params.toString()}`)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent">
        <main className="container mx-auto px-4 py-12 md:py-16">
          <section
            className="mx-auto max-w-2xl rounded-[16px] border p-6 md:p-8"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(196,106,61,0.25)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), 0 0 12px rgba(196,106,61,0.10)',
            }}
          >
            <h1 className="text-2xl font-bold" style={{ color: '#2D2A6E' }}>
              Purchase Fertilizer
            </h1>

            <form className="mt-6 space-y-4" onSubmit={handleProceed}>
              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: '#2D2A6E' }}>
                  Crop
                </label>
                <input
                  value={crop ? toTitle(crop) : ''}
                  readOnly
                  className="w-full rounded-[12px] border px-4 py-2.5"
                  style={{ borderColor: 'rgba(196,106,61,0.3)', background: 'rgba(255,255,255,0.6)' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: '#2D2A6E' }}>
                  Item Name
                </label>
                <select
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  className="w-full rounded-[12px] border px-4 py-2.5"
                  style={{ borderColor: 'rgba(196,106,61,0.3)', background: 'rgba(255,255,255,0.6)' }}
                >
                  <option value="">Select item</option>
                  {itemsForCrop.map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name} - ₹{entry.price}/{entry.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: '#2D2A6E' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full rounded-[12px] border px-4 py-2.5"
                  style={{ borderColor: 'rgba(196,106,61,0.3)', background: 'rgba(255,255,255,0.6)' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: '#2D2A6E' }}>
                  Delivery Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-[12px] border px-4 py-2.5"
                  style={{ borderColor: 'rgba(196,106,61,0.3)', background: 'rgba(255,255,255,0.6)' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: '#2D2A6E' }}>
                  Mobile Number
                </label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-[12px] border px-4 py-2.5"
                  style={{ borderColor: 'rgba(196,106,61,0.3)', background: 'rgba(255,255,255,0.6)' }}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-[12px] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95"
                style={{ backgroundColor: '#C46A3D', boxShadow: '0 10px 20px rgba(196,106,61,0.24)' }}
                disabled={!selectedItem}
              >
                Proceed to Charges
              </button>
            </form>
          </section>
        </main>
        <Footer />
      </div>
    </DashboardLayout>
  )
}
