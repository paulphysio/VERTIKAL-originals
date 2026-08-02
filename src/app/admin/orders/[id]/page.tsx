'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ArrowLeft, MapPin, CreditCard, Package } from 'lucide-react'
import { sendOrderStatusUpdate } from '@/lib/actions/email'

export default function AdminOrderDetailPage() {
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
          profiles!user_id(full_name, phone),
          order_items(*)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching order:', error.message, error.details)
      } else {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [params.id, supabase])

  const updateOrderStatus = async (status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)

    if (!error) {
      setOrder({ ...order, status })
      
      // Send email notification to customer
      const customerEmail = order.shipping_address?.email
      const customerName = order.profiles?.full_name || order.shipping_address?.fullName
      
      if (customerEmail && customerName) {
        await sendOrderStatusUpdate(customerEmail, customerName, order.id, status)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-acid text-ink'
      case 'confirmed':
        return 'bg-coral text-paper'
      case 'processing':
        return 'bg-ink text-paper'
      case 'shipped':
        return 'bg-concrete text-ink'
      case 'delivered':
        return 'bg-acid text-ink'
      case 'cancelled':
        return 'bg-coral text-paper'
      default:
        return 'bg-concrete text-ink'
    }
  }

  if (loading) {
    return (
      <div className="text-center font-mono text-sm py-16">
        LOADING...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="font-mono text-sm text-ink/50">Order not found</p>
        <button
          onClick={() => router.push('/admin/orders')}
          className="mt-4 font-mono text-sm font-bold text-ink hover:text-coral transition"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => router.push('/admin/orders')}
        className="flex items-center gap-2 text-ink hover:text-coral mb-6 font-mono text-sm font-bold uppercase transition"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="border-2 border-ink p-6 bg-paper">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="font-display text-3xl uppercase">{order.order_number || order.id.slice(0, 8)}</h1>
                <p className="font-mono text-sm text-ink/50">{formatDate(order.created_at)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Update Status</label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  className={`px-4 py-2 border-2 border-ink font-mono text-sm font-bold uppercase cursor-pointer ${getStatusColor(
                    order.status
                  )}`}
                >
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="processing">PROCESSING</option>
                  <option value="shipped">SHIPPED</option>
                  <option value="delivered">DELIVERED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-2 border-ink p-6 bg-paper">
            <h2 className="font-display text-2xl uppercase mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p className="font-mono text-sm"><span className="font-bold uppercase">Name:</span> {order.profiles?.full_name || 'N/A'}</p>
              <p className="font-mono text-sm"><span className="font-bold uppercase">Phone:</span> {order.profiles?.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-2 border-ink p-6 bg-paper">
            <h2 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-4 border-b border-ink last:border-0"
                >
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase">{item.product_name}</h3>
                    <p className="font-mono text-[11px] text-ink/50">
                      {item.size} / {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-bold">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-2 border-ink p-6 bg-paper">
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
          <div className="border-2 border-ink p-6 bg-paper">
            <h2 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-mono text-sm text-ink/50 uppercase">Method</span>
                <span className="font-mono text-sm font-bold uppercase">
                  {order.payment_method.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-sm text-ink/50 uppercase">Status</span>
                <span className="font-mono text-sm font-bold uppercase">{order.payment_status}</span>
              </div>
              {order.paystack_reference && (
                <div className="flex justify-between">
                  <span className="font-mono text-sm text-ink/50 uppercase">Reference</span>
                  <span className="font-mono text-sm font-bold">{order.paystack_reference}</span>
                </div>
              )}
              {order.receipt_url && (
                <div className="flex justify-between">
                  <span className="font-mono text-sm text-ink/50 uppercase">Receipt</span>
                  <a
                    href={order.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-bold text-ink hover:text-coral transition"
                  >
                    View Receipt
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border-2 border-ink p-6 bg-paper sticky top-6">
            <h2 className="font-display text-2xl uppercase mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-mono text-sm text-ink/50 uppercase">Subtotal</span>
                <span className="font-mono text-sm">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-coral">
                  <span className="font-mono text-sm uppercase">Discount</span>
                  <span className="font-mono text-sm">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-mono text-sm text-ink/50 uppercase">Shipping</span>
                <span className="font-mono text-sm">{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="border-t-2 border-ink pt-3 flex justify-between font-display text-xl uppercase">
                <span>Total</span>
                <span className="text-coral">{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 pt-6 border-t-2 border-ink">
                <h3 className="font-display text-lg uppercase mb-2">Order Notes</h3>
                <p className="font-mono text-sm text-ink/70">{order.notes}</p>
              </div>
            )}

            {order.tracking_number && (
              <div className="mt-6 pt-6 border-t-2 border-ink">
                <h3 className="font-display text-lg uppercase mb-2">Tracking Number</h3>
                <p className="font-mono text-sm text-ink/70">{order.tracking_number}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
