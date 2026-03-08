'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Footer from '@/components/Footer'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { FiCheckCircle, FiMapPin, FiPrinter } from 'react-icons/fi'

interface Order {
  crop: string
  product: string
  quantity: number
  itemPrice: number
  unit: string
  transportFee: number
  platformFee: number
  totalPrice: number
  address: string
  mobile: string
  createdAt: any
}

function toTitle(text: string) {
  return text
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function ReceiptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || ''
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided')
        setLoading(false)
        return
      }

      try {
        const orderRef = doc(db, 'orders', orderId)
        const orderSnap = await getDoc(orderRef)

        if (orderSnap.exists()) {
          setOrder(orderSnap.data() as Order)
        } else {
          setError('Order not found')
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt.toDate()).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('en-IN', {
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
          <div id="receipt-print" className="mx-auto max-w-xl">
            <section
              className="rounded-[16px] border p-6 md:p-8"
              style={{
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(196,106,61,0.25)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05), 0 0 14px rgba(196,106,61,0.10)',
              }}
            >
              <div className="hidden border-b border-dashed border-gray-300 pb-3 text-center print:block">
                <p className="text-base font-semibold" style={{ color: '#2D2A6E' }}>KrishiKonnect</p>
                <p className="text-xs text-gray-600">Digital Platform for Farmers</p>
              </div>

              <div className="mb-6 mt-2 flex items-center gap-3 print:mt-4">
                <FiCheckCircle className="text-3xl text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: '#2D2A6E' }}>
                    Order Confirmed
                  </h2>
                  <p className="text-sm text-gray-600">
                    Thank you for your purchase. Your order has been successfully placed.
                  </p>
                </div>
              </div>

              <h1 className="text-2xl font-bold" style={{ color: '#2D2A6E' }}>
                KrishiKonnect Purchase Receipt
              </h1>
              <p className="mt-1 text-sm text-gray-600">Order details and payment summary</p>

              {loading && (
                <div className="mt-6 text-center text-sm" style={{ color: '#2D2A6E' }}>
                  Loading order details...
                </div>
              )}

              {error && (
                <div className="mt-6 rounded-[12px] border border-red-300 bg-red-50 p-4 text-sm" style={{ color: '#c53030' }}>
                  {error}
                </div>
              )}

              {order && (
                <>
                  <div className="mt-7 border-t border-dashed border-gray-300 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order Information</p>
                    <div className="mt-3 space-y-2 text-sm" style={{ color: '#2D2A6E' }}>
                      <p><span className="font-semibold">Order ID:</span> {orderId}</p>
                      <p><span className="font-semibold">Date:</span> {formattedDate}</p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">Order Status:</span>
                        <span className="rounded px-2 py-1 text-xs font-medium text-green-700 bg-green-100">Confirmed</span>
                      </p>
                      <p><span className="font-semibold">Estimated Delivery:</span> 2-3 Days</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-dashed border-gray-300 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product Details</p>
                    <div className="mt-3 space-y-2 text-sm" style={{ color: '#2D2A6E' }}>
                      <p><span className="font-semibold">Crop:</span> {toTitle(order.crop)}</p>
                      <p><span className="font-semibold">Product:</span> {order.product}</p>
                      <p><span className="font-semibold">Quantity:</span> {order.quantity} {order.quantity > 1 ? `${order.unit}s` : order.unit}</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-dashed border-gray-300 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment Breakdown</p>
                    <div className="mt-3 space-y-2 text-sm" style={{ color: '#2D2A6E' }}>
                      <p><span className="font-semibold">Item Price:</span> ₹{order.itemPrice.toLocaleString('en-IN')} / {order.unit}</p>
                      <p><span className="font-semibold">Transport Fee:</span> ₹{order.transportFee.toLocaleString('en-IN')}</p>
                      <p><span className="font-semibold">Platform Fee:</span> ₹{order.platformFee.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[12px] border border-orange-200 bg-orange-50 p-4">
                    <p className="text-lg font-semibold" style={{ color: '#C46A3D' }}>
                      Total Paid: ₹{order.totalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="mt-6 rounded-[12px] border border-orange-100 bg-orange-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#2D2A6E' }}>
                      Delivery Address
                    </p>
                    <p className="mt-2 flex items-start gap-2 text-sm" style={{ color: '#2D2A6E' }}>
                      <FiMapPin className="mt-[2px] text-base text-[#C46A3D]" />
                      <span>{order.address}</span>
                    </p>
                    <p className="mt-2 text-sm" style={{ color: '#2D2A6E' }}>
                      <span className="font-semibold">Mobile:</span> {order.mobile}
                    </p>
                  </div>

                  <p className="mt-6 text-center text-xs text-gray-600">
                    Thank you for supporting smart farming with KrishiKonnect.
                  </p>

                  <div className="mt-6 space-y-3 print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#C46A3D', boxShadow: '0 10px 20px rgba(196,106,61,0.24)' }}
                    >
                      <FiPrinter />
                      Print Receipt
                    </button>

                    <button
                      onClick={() => router.push('/mandi')}
                      className="w-full rounded-xl border border-[#C46A3D] bg-white py-3 text-sm font-semibold text-[#C46A3D] transition hover:bg-orange-50"
                    >
                      Back to Krishi Bazaar
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </DashboardLayout>
  )
}
