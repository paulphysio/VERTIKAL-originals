'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchOrders()
  }, [supabase])

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

  return (
    <div className="px-4 py-16 sm:px-10">
      <h1 className="font-display text-4xl uppercase mb-8">MY ORDERS</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto text-ink/20 mb-4" />
          <h2 className="font-display text-2xl uppercase mb-2">No orders yet</h2>
          <p className="font-mono text-sm text-ink/50 mb-8">
            When you place an order, it will appear here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border-2 border-ink p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl uppercase">{order.order_number}</h3>
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

              <div className="space-y-2 mb-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between font-mono text-sm">
                    <span className="text-ink/70">
                      {item.product_name} ({item.size} / {item.color}) x {item.quantity}
                    </span>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-ink pt-4 flex justify-between items-center">
                <div>
                  <p className="font-mono text-[11px] text-ink/50 uppercase">Payment Method</p>
                  <p className="font-mono text-sm font-bold capitalize">{order.payment_method.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11px] text-ink/50 uppercase">Total</p>
                  <p className="font-display text-xl font-bold text-coral">{formatPrice(order.total)}</p>
                </div>
              </div>

              <Link
                href={`/account/orders/${order.id}`}
                className="block mt-4 text-center text-coral hover:text-ink font-mono text-[11px] font-bold uppercase tracking-wide transition"
              >
                View Order Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
