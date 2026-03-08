'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiShoppingBag, FiExternalLink } from 'react-icons/fi'
import { collection, onSnapshot, orderBy, query, type Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type FirestoreTimestampLike = Timestamp | { seconds: number; toDate?: () => Date } | Date | string | number | null

interface OrderItem {
  id: string
  crop?: string
  product?: string
  totalPrice?: number
  createdAt?: FirestoreTimestampLike
  status?: string
}

function toTitle(text: string): string {
  if (!text) return 'Order'

  return text
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function toDate(value: FirestoreTimestampLike | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      const fromToDate = value.toDate()
      return Number.isNaN(fromToDate.getTime()) ? null : fromToDate
    }

    if (typeof value.seconds === 'number') {
      const fromSeconds = new Date(value.seconds * 1000)
      return Number.isNaN(fromSeconds.getTime()) ? null : fromSeconds
    }
  }

  return null
}

function statusClasses(status: string): string {
  const normalized = status.toLowerCase()

  if (normalized === 'delivered') {
    return 'bg-green-100 text-green-700'
  }

  if (normalized === 'processing') {
    return 'bg-amber-100 text-amber-700'
  }

  return 'bg-blue-100 text-blue-700'
}

export default function YourOrdersCard() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const raw = docSnap.data() as Omit<OrderItem, 'id'>
          return {
            id: docSnap.id,
            crop: raw.crop,
            product: raw.product,
            totalPrice: raw.totalPrice,
            createdAt: raw.createdAt,
            status: raw.status,
          }
        })

        setOrders(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error subscribing to orders:', error)
        setOrders([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const visibleOrders = useMemo(() => orders.slice(0, 10), [orders])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="dashboard-card bg-white/55 backdrop-blur-[10px] rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.05),0_0_18px_rgba(196,106,61,0.12)] border border-[rgba(196,106,61,0.35)] p-6 h-full flex flex-col hover:shadow-[0_10px_30px_rgba(0,0,0,0.08),0_0_22px_rgba(196,106,61,0.18)] transition-all duration-250"
      style={{ WebkitBackdropFilter: 'blur(10px)' }}
    >
      <h3 className="text-lg font-semibold text-[#2D2A6E] flex items-center gap-2 mb-4">
        <FiShoppingBag size={24} className="text-[#C46A3D]" />
        Your Orders
      </h3>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-[#2D2A6E]/70">
          Loading orders...
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-base font-semibold text-[#2D2A6E]">No purchases yet</p>
          <p className="mt-1 text-sm text-[#2D2A6E]/70">Buy fertilizers from Krishi Bazaar</p>
          <button
            onClick={() => router.push('/mandi')}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#1F3C88' }}
          >
            Go to Bazaar
          </button>
        </div>
      ) : (
        <div className="max-h-[180px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-orange-200">
          {visibleOrders.map((order) => {
            const createdDate = toDate(order.createdAt)
            const formattedDate = createdDate
              ? createdDate.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recently'

            const status = order.status || 'Confirmed'

            return (
              <div
                key={order.id}
                className="p-3 border rounded-xl bg-white/40 backdrop-blur-sm"
                style={{ borderColor: 'rgba(196,106,61,0.25)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#2D2A6E]">
                      {toTitle(order.crop || '')} {'•'} {order.product || 'Input'}
                    </p>
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                    <button
                      onClick={() => router.push(`/receipt?orderId=${order.id}`)}
                      className="mt-2 flex items-center gap-1 text-xs px-3 py-1 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 transition"
                    >
                      Check Status
                      <FiExternalLink size={12} />
                    </button>
                  </div>

                  <div className="text-[#C46A3D] font-semibold whitespace-nowrap">
                    ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
