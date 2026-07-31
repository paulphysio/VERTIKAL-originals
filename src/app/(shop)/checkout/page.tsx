'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, Upload, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, getTotal, clearCart } = useCartStore()
  
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bank'>('paystack')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  })

  const subtotal = getTotal()
  const shipping = subtotal >= 10000 ? 0 : 1000
  const total = subtotal + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePaystackPayment = async () => {
    setLoading(true)
    try {
      // In production, integrate Paystack here
      // For now, we'll simulate the payment
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal,
          discount: 0,
          shipping_fee: shipping,
          total,
          payment_method: 'paystack',
          payment_status: 'pending',
          shipping_address: formData,
          notes: formData.notes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      clearCart()
      router.push(`/account/orders/${order.id}`)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBankTransfer = async () => {
    if (!receiptFile) {
      alert('Please upload your transfer receipt')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Upload receipt to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          subtotal,
          discount: 0,
          shipping_fee: shipping,
          total,
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          receipt_url: publicUrl,
          shipping_address: formData,
          notes: formData.notes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      clearCart()
      router.push(`/account/orders/${order.id}`)
    } catch (error) {
      console.error('Order error:', error)
      alert('Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="text-center">
          <h1 className="font-display text-4xl uppercase mb-4">YOUR BAG IS EMPTY</h1>
          <button
            onClick={() => router.push('/products')}
            className="font-mono text-sm text-coral hover:underline"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-16 sm:px-10">
      <h1 className="font-display text-4xl uppercase mb-8">CHECKOUT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Information */}
          <div className="border-2 border-ink p-6">
            <h2 className="font-display text-2xl uppercase mb-6">SHIPPING INFORMATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-2 border-ink p-6">
            <h2 className="font-display text-2xl uppercase mb-6">PAYMENT METHOD</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMethod('paystack')}
                className={`w-full p-4 border-2 flex items-center gap-4 font-mono text-sm ${
                  paymentMethod === 'paystack' ? 'border-ink bg-ink text-paper' : 'border-ink hover:border-coral'
                }`}
              >
                <div className="text-left flex-1">
                  <p className="font-bold uppercase">Pay with Card</p>
                  <p className="text-xs opacity-70">Secure payment via Paystack</p>
                </div>
                {paymentMethod === 'paystack' && (
                  <span className="text-coral">✓</span>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod('bank')}
                className={`w-full p-4 border-2 flex items-center gap-4 font-mono text-sm ${
                  paymentMethod === 'bank' ? 'border-ink bg-ink text-paper' : 'border-ink hover:border-coral'
                }`}
              >
                <div className="text-left flex-1">
                  <p className="font-bold uppercase">Bank Transfer</p>
                  <p className="text-xs opacity-70">Transfer and upload receipt</p>
                </div>
                {paymentMethod === 'bank' && (
                  <span className="text-coral">✓</span>
                )}
              </button>
            </div>

            {paymentMethod === 'bank' && (
              <div className="mt-6 p-4 bg-concrete/20 border-2 border-ink">
                <h3 className="font-mono text-[11px] font-bold uppercase mb-2">Bank Details</h3>
                <p className="font-mono text-sm text-ink/70 mb-4">
                  Bank: Zenith Bank<br />
                  Account Name: VERTIKAL originals<br />
                  Account Number: 1234567890
                </p>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Upload Receipt</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="w-full font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="border-2 border-ink p-6">
            <h2 className="font-display text-2xl uppercase mb-6">ORDER NOTES (OPTIONAL)</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              placeholder="Any special instructions for your order..."
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border-2 border-ink p-6 sticky top-24">
            <h2 className="font-display text-2xl uppercase mb-6">ORDER SUMMARY</h2>

            <div className="space-y-3 mb-6 font-mono text-sm">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between">
                  <span className="text-ink/70">
                    {item.name} x {item.quantity}
                  </span>
                  <span>₦{Math.round(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t-2 border-ink pt-4 flex justify-between">
                <span className="text-ink/70">SUBTOTAL</span>
                <span>₦{Math.round(subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/70">SHIPPING</span>
                <span>{shipping === 0 ? 'FREE' : '₦1,000'}</span>
              </div>
              <div className="border-t-2 border-ink pt-4 flex justify-between font-bold text-base">
                <span>TOTAL</span>
                <span className="text-coral">₦{Math.round(total).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={paymentMethod === 'paystack' ? handlePaystackPayment : handleBankTransfer}
              disabled={loading || (paymentMethod === 'bank' && !receiptFile)}
              className="w-full px-6 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed transition"
            >
              {loading ? 'PROCESSING...' : paymentMethod === 'paystack' ? 'PAY NOW' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
