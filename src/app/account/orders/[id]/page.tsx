'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
      } else {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [params.id, supabase])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-concrete text-ink'
      case 'confirmed':
        return 'bg-acid text-ink'
      case 'processing':
        return 'bg-coral text-paper'
      case 'shipped':
        return 'bg-ink text-paper'
      case 'delivered':
        return 'bg-acid text-ink'
      case 'cancelled':
        return 'bg-ink text-paper'
      default:
        return 'bg-concrete text-ink'
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="text-center font-mono text-sm">LOADING...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="px-4 py-16 sm:px-10 text-center">
        <p className="font-mono text-sm text-ink/70">Order not found</p>
        <button
          onClick={() => router.push('/account/orders')}
          className="mt-4 text-coral hover:text-ink font-mono text-[11px] font-bold uppercase tracking-wide transition"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-16 sm:px-10">
      <button
        onClick={() => router.push('/account/orders')}
        className="flex items-center gap-2 text-coral hover:text-ink font-mono text-[11px] font-bold uppercase tracking-wide mb-6 transition"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="border-2 border-ink p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="font-display text-3xl uppercase">{order.order_number}</h1>
                <p className="font-mono text-[11px] text-ink/50">{formatDate(order.created_at)}</p>
              </div>
              <span
                className={`inline-block px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wide ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-2 border-ink p-6">
            <h2 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-4 border-b-2 border-ink last:border-0"
                >
                  <div>
                    <h3 className="font-display text-lg uppercase">{item.product_name}</h3>
                    <p className="font-mono text-[11px] text-ink/50">
                      {item.size} / {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono font-bold">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-2 border-ink p-6">
            <h2 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h2>
            <div className="font-mono text-sm text-ink/70">
              <p>{order.shipping_address?.fullName}</p>
              <p>{order.shipping_address?.address}</p>
              <p>
                {order.shipping_address?.city}, {order.shipping_address?.state}
              </p>
              <p>{order.shipping_address?.postalCode}</p>
              <p>{order.shipping_address?.phone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-2 border-ink p-6">
            <h2 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-ink/50 uppercase">Method</span>
                <span className="font-bold capitalize">
                  {order.payment_method.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50 uppercase">Status</span>
                <span className="font-bold capitalize">{order.payment_status}</span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between">
                  <span className="text-ink/50 uppercase">Tracking Number</span>
                  <span className="font-bold">{order.tracking_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border-2 border-ink p-6 sticky top-24">
            <h2 className="font-display text-2xl uppercase mb-4">Order Summary</h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-ink/50 uppercase">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-coral">
                  <span className="uppercase">Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink/50 uppercase">Shipping</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="border-t-2 border-ink pt-3 flex justify-between font-bold text-lg">
                <span className="uppercase">Total</span>
                <span className="text-coral">{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 pt-6 border-t-2 border-ink">
                <h3 className="font-display text-lg uppercase mb-2">Order Notes</h3>
                <p className="font-mono text-sm text-ink/70">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
