'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Footer from '@/components/Footer'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useLanguage } from '@/lib/LanguageContext'
import { formatBilingual, getCropHindiName, getFertilizerHindiName } from '@/data/fertilizers'

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
  const { lang } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

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
  const t = lang === 'hi'
    ? {
        title: 'चार्जेस सारांश',
        crop: 'फसल',
        product: 'उत्पाद',
        itemPrice: 'उत्पाद मूल्य',
        quantity: 'मात्रा',
        transportFee: 'परिवहन शुल्क',
        platformFee: 'प्लेटफॉर्म शुल्क',
        total: 'कुल',
        confirmOrder: 'ऑर्डर कन्फर्म करें',
        savingOrder: 'ऑर्डर सेव हो रहा है...',
        cancel: 'रद्द करें',
        delivery: 'डिलीवरी',
        mobile: 'मोबाइल',
        saveFailed: 'ऑर्डर सेव नहीं हो सका। कृपया दोबारा कोशिश करें।',
      }
    : {
        title: 'Charges Summary',
        crop: 'Crop',
        product: 'Product',
        itemPrice: 'Item Price',
        quantity: 'Quantity',
        transportFee: 'Transport Fee',
        platformFee: 'Platform Fee',
        total: 'Total',
        confirmOrder: 'Confirm Order',
        savingOrder: 'Saving Order...',
        cancel: 'Cancel',
        delivery: 'Delivery',
        mobile: 'Mobile',
        saveFailed: 'Failed to save order. Please try again.',
      }
  const cropDisplay = lang === 'hi'
    ? formatBilingual(toTitle(crop), getCropHindiName(crop), true)
    : toTitle(crop)
  const itemDisplay = lang === 'hi'
    ? formatBilingual(item, getFertilizerHindiName(item), true)
    : item

  const saveOrder = async () => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        crop,
        product: item,
        quantity,
        itemPrice,
        unit,
        transportFee,
        platformFee,
        totalPrice: total,
        address,
        mobile,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error saving order:', error)
      throw error
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const orderId = await saveOrder()
      router.push(`/receipt?orderId=${orderId}`)
    } catch (error) {
      setIsLoading(false)
      alert(t.saveFailed)
    }
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
              {t.title}
            </h1>

            <div className="mt-6 space-y-3 text-sm" style={{ color: '#2D2A6E' }}>
              <p><span className="font-semibold">{t.crop}:</span> {cropDisplay}</p>
              <p><span className="font-semibold">{t.product}:</span> {itemDisplay}</p>
              <p><span className="font-semibold">{t.itemPrice}:</span> ₹{itemPrice.toLocaleString('en-IN')} / {unit}</p>
              <p><span className="font-semibold">{t.quantity}:</span> {quantity} {quantity > 1 ? `${unit}s` : unit}</p>
              <p><span className="font-semibold">{t.transportFee}:</span> ₹{transportFee.toLocaleString('en-IN')}</p>
              <p><span className="font-semibold">{t.platformFee}:</span> ₹{platformFee.toLocaleString('en-IN')}</p>
            </div>

            <div className="mt-6 rounded-[12px] border p-4" style={{ borderColor: 'rgba(196,106,61,0.3)' }}>
              <p className="text-lg font-bold" style={{ color: '#C46A3D' }}>
                {t.total} = ₹{total.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="rounded-[12px] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-95 disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C46A3D', boxShadow: '0 10px 20px rgba(196,106,61,0.24)' }}
              >
                {isLoading ? t.savingOrder : t.confirmOrder}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-[12px] border px-4 py-3 text-sm font-semibold"
                style={{ borderColor: 'rgba(45,42,110,0.25)', color: '#2D2A6E', background: 'rgba(255,255,255,0.6)' }}
              >
                {t.cancel}
              </button>
            </div>

            <p className="mt-4 text-xs" style={{ color: 'rgba(45,42,110,0.7)' }}>
              {t.delivery}: {address} | {t.mobile}: {mobile}
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </DashboardLayout>
  )
}
