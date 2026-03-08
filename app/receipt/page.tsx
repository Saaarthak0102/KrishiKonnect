'use client'

import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Footer from '@/components/Footer'

function toTitle(text: string) {
  return text
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function ReceiptPage() {
  const searchParams = useSearchParams()

  const orderId = searchParams.get('orderId') || 'KK-DEMO-001'
  const crop = searchParams.get('crop') || ''
  const item = searchParams.get('item') || ''
  const quantity = searchParams.get('quantity') || '1'
  const unit = searchParams.get('unit') || 'bag'
  const total = Number(searchParams.get('total') || '0')
  const address = searchParams.get('address') || ''
  const date = searchParams.get('date') || new Date().toISOString()

  const formattedDate = new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

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
              KrishiKonnect Receipt
            </h1>

            <div className="mt-6 space-y-3 text-sm" style={{ color: '#2D2A6E' }}>
              <p><span className="font-semibold">Order ID:</span> {orderId}</p>
              <p><span className="font-semibold">Date:</span> {formattedDate}</p>
              <p><span className="font-semibold">Crop:</span> {toTitle(crop)}</p>
              <p><span className="font-semibold">Product:</span> {item}</p>
              <p><span className="font-semibold">Quantity:</span> {quantity} {Number(quantity) > 1 ? `${unit}s` : unit}</p>
              <p><span className="font-semibold">Total Paid:</span> ₹{total.toLocaleString('en-IN')}</p>
              <p><span className="font-semibold">Delivery Address:</span> {address}</p>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-6 w-full rounded-[12px] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95"
              style={{ backgroundColor: '#C46A3D', boxShadow: '0 10px 20px rgba(196,106,61,0.24)' }}
            >
              Print Receipt
            </button>
          </section>
        </main>
        <Footer />
      </div>
    </DashboardLayout>
  )
}
