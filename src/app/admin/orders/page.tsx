'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { sendOrderStatusUpdate } from '@/lib/actions/email'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles!user_id(full_name)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching orders:', error.message, error.details)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchOrders()
  }, [supabase, filter])

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const updateOrderStatus = async (orderId: string, status: string) => {
    console.log('updateOrderStatus called:', { orderId, status })
    
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (!error) {
      setOrders(orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ))
      
      // Send email notification to customer
      const order = orders.find(o => o.id === orderId)
      if (order) {
        const customerEmail = order.shipping_address?.email
        const customerName = order.profiles?.full_name || order.shipping_address?.fullName
        
        console.log('Sending status update email:', { customerEmail, customerName, orderId, status })
        
        if (customerEmail && customerName) {
          await sendOrderStatusUpdate(customerEmail, customerName, orderId, status)
        } else {
          console.warn('Missing customer email or name')
        }
      }
    } else {
      console.error('Failed to update order status:', error)
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="font-display text-4xl uppercase">ORDERS</h1>
      </div>

      {/* Filters */}
      <div className="border-2 border-ink p-6 bg-paper mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink/50" />
            <input
              type="text"
              placeholder="SEARCH ORDERS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-ink/50" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
            >
              <option value="all">ALL STATUS</option>
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

      {/* Orders Table */}
      <div className="border-2 border-ink bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="font-mono text-[11px] font-bold uppercase text-ink/50 border-b-2 border-ink">
                <th className="px-6 py-3 text-left">Order #</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center font-mono text-sm text-ink/50">
                    NO ORDERS FOUND
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-concrete/20">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm font-bold hover:text-coral transition"
                      >
                        {order.order_number || order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm font-bold uppercase">{order.profiles?.full_name || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ink/70">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 border-2 border-ink font-mono text-[11px] font-bold uppercase cursor-pointer ${getStatusColor(
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
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm font-bold text-ink hover:text-coral transition"
                      >
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
