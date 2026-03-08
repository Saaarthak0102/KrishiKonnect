'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Footer from '@/components/Footer'

function toTitle(text: string) {
  return text
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function BuySummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const crop = searchParams.get('crop') || ''
  const item = searchParams.get('item') || ''
  const quantity = Number(searchParams.get('quantity') || '1')
  const itemPrice = Number(searchParams.get('itemPrice') || '0')
  const unit = searchParams.get('unit') || 'bag'
  const address = searchParams.get('address') || ''
  const mobile = searchParams.get('mobile') || ''

  const transportFee = 80
  const platformFee = 20

  const total = useMemo(() => itemPrice * quantity + transportFee + platformFee, [itemPrice, quantity])

  const handleConfirm = () => {
    const orderId = `KK-${Date.now()}`
    const params = new URLSearchParams({
      orderId,
      crop,
      item,
      quantity: String(quantity),
      unit,
      address,
      mobile,
      total: String(total),
      date: new Date().toISOString(),
    })
    router.push(`/receipt?${params.toString()}`)
  }

  const handleCancel = () => {
    router.push('/mandi')
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
              Charges Summary
            </h1>

            <div className="mt-6 space-y-3 text-sm" style={{ color: '#2D2A6E' }}>
              <p><span className="font-semibold">Crop:</span> {toTitle(crop)}</p>
              <p><span className="font-semibold">Product:</span> {item}</p>
              <p><span className="font-semibold">Item Price:</span> ₹{itemPrice.toLocaleString('en-IN')} / {unit}</p>
              <p><span className="font-semibold">Quantity:</span> {quantity} {quantity > 1 ? `${unit}s` : unit}</p>
              <p><span className="font-semibold">Transport Fee:</span> ₹{transportFee.toLocaleString('en-IN')}</p>
              <p><span className="font-semibold">Platform Fee:</span> ₹{platformFee.toLocaleString('en-IN')}</p>
            </div>

            <div className="mt-6 rounded-[12px] border p-4" style={{ borderColor: 'rgba(196,106,61,0.3)' }}>
              <p className="text-lg font-bold" style={{ color: '#C46A3D' }}>
                Total = ₹{total.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleConfirm}
                className="rounded-[12px] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95"
                style={{ backgroundColor: '#C46A3D', boxShadow: '0 10px 20px rgba(196,106,61,0.24)' }}
              >
                Confirm Order
              </button>
              <button
                onClick={handleCancel}
                className="rounded-[12px] border px-4 py-3 text-sm font-semibold"
                style={{ borderColor: 'rgba(45,42,110,0.25)', color: '#2D2A6E', background: 'rgba(255,255,255,0.6)' }}
              >
                Cancel
              </button>
            </div>

            <p className="mt-4 text-xs" style={{ color: 'rgba(45,42,110,0.7)' }}>
              Delivery: {address} | Mobile: {mobile}
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </DashboardLayout>
  )
}
