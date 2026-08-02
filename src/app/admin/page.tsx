'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch orders count and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
      
      const totalOrders = orders?.length || 0
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')

      // Fetch recent orders
      const { data: recent } = await supabase
        .from('orders')
        .select('*, profiles!user_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
      })
      setRecentOrders(recent || [])
      setLoading(false)
    }

    fetchStats()
  }, [supabase])

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
      <h1 className="font-display text-4xl uppercase mb-8">DASHBOARD</h1>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Link
          href="/admin/products"
          className="border-2 border-ink p-4 bg-paper hover:bg-concrete/20 transition text-center"
        >
          <Package className="h-6 w-6 mx-auto mb-2" />
          <p className="font-mono text-xs font-bold uppercase">Products</p>
        </Link>
        <Link
          href="/admin/orders"
          className="border-2 border-ink p-4 bg-paper hover:bg-concrete/20 transition text-center"
        >
          <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
          <p className="font-mono text-xs font-bold uppercase">Orders</p>
        </Link>
        <Link
          href="/admin/categories"
          className="border-2 border-ink p-4 bg-paper hover:bg-concrete/20 transition text-center"
        >
          <TrendingUp className="h-6 w-6 mx-auto mb-2" />
          <p className="font-mono text-xs font-bold uppercase">Categories</p>
        </Link>
        <Link
          href="/admin/customers"
          className="border-2 border-ink p-4 bg-paper hover:bg-concrete/20 transition text-center"
        >
          <Users className="h-6 w-6 mx-auto mb-2" />
          <p className="font-mono text-xs font-bold uppercase">Customers</p>
        </Link>
        <Link
          href="/admin/settings"
          className="border-2 border-ink p-4 bg-paper hover:bg-concrete/20 transition text-center"
        >
          <Settings className="h-6 w-6 mx-auto mb-2" />
          <p className="font-mono text-xs font-bold uppercase">Settings</p>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="border-2 border-ink p-6 bg-paper">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase text-ink/50 mb-2">Total Orders</p>
              <p className="font-display text-3xl uppercase">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-acid border-2 border-ink flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-ink" />
            </div>
          </div>
        </div>

        <div className="border-2 border-ink p-6 bg-paper">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase text-ink/50 mb-2">Total Revenue</p>
              <p className="font-display text-3xl uppercase">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-coral border-2 border-ink flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-paper" />
            </div>
          </div>
        </div>

        <div className="border-2 border-ink p-6 bg-paper">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase text-ink/50 mb-2">Total Products</p>
              <p className="font-display text-3xl uppercase">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-concrete border-2 border-ink flex items-center justify-center">
              <Package className="h-6 w-6 text-ink" />
            </div>
          </div>
        </div>

        <div className="border-2 border-ink p-6 bg-paper">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase text-ink/50 mb-2">Total Customers</p>
              <p className="font-display text-3xl uppercase">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-ink border-2 border-ink flex items-center justify-center">
              <Users className="h-6 w-6 text-paper" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="border-2 border-ink bg-paper">
        <div className="p-6 border-b-2 border-ink">
          <h2 className="font-display text-2xl uppercase">Recent Orders</h2>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <p className="font-mono text-sm text-ink/50 text-center py-8">NO ORDERS YET</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="font-mono text-[11px] font-bold uppercase text-ink/50 border-b-2 border-ink">
                    <th className="pb-3 text-left">Order #</th>
                    <th className="pb-3 text-left">Date</th>
                    <th className="pb-3 text-left">Status</th>
                    <th className="pb-3 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-ink last:border-0">
                      <td className="py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-sm font-bold hover:text-coral transition"
                        >
                          {order.order_number || order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-4 font-mono text-sm text-ink/70">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 border-2 border-ink font-mono text-[11px] font-bold uppercase ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-sm font-bold">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
