'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ArrowLeft, MapPin, CreditCard, Package } from 'lucide-react'

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
          profiles(full_name, email, phone),
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

  const updateOrderStatus = async (status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)

    if (!error) {
      setOrder({ ...order, status })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center">Loading order...</div>
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Order not found</p>
        <button
          onClick={() => router.push('/admin/orders')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
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
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{order.order_number}</h1>
                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <label className="block text-sm font-medium mb-2">Update Status</label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  className={`px-4 py-2 rounded-lg font-medium border-0 cursor-pointer ${getStatusColor(
                    order.status
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.profiles?.full_name}</p>
              <p><span className="font-medium">Email:</span> {order.profiles?.email}</p>
              <p><span className="font-medium">Phone:</span> {order.profiles?.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-4 border-b last:border-0"
                >
                  <div>
                    <h3 className="font-semibold">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.size} / {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h2>
            <div className="text-gray-600">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium capitalize">
                  {order.payment_method.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium capitalize">{order.payment_status}</span>
              </div>
              {order.paystack_reference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-medium">{order.paystack_reference}</span>
                </div>
              )}
              {order.receipt_url && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt</span>
                  <a
                    href={order.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:text-indigo-700"
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
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-indigo-600">{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Order Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            {order.tracking_number && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">Tracking Number</h3>
                <p className="text-sm text-gray-600">{order.tracking_number}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
