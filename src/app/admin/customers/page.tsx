'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customers:', error.message, error.details)
      } else {
        setCustomers(data || [])
      }
      setLoading(false)
    }

    fetchCustomers()
  }, [supabase])

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const updateCustomerRole = async (customerId: string, role: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', customerId)

    if (!error) {
      setCustomers(customers.map((c) =>
        c.id === customerId ? { ...c, role } : c
      ))
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
      <h1 className="font-display text-4xl uppercase mb-8">CUSTOMERS</h1>

      {/* Search */}
      <div className="border-2 border-ink p-6 bg-paper mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink/50" />
          <input
            type="text"
            placeholder="SEARCH CUSTOMERS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="border-2 border-ink bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="font-mono text-[11px] font-bold uppercase text-ink/50 border-b-2 border-ink">
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Loyalty Points</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center font-mono text-sm text-ink/50">
                    NO CUSTOMERS FOUND
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-concrete/20">
                    <td className="px-6 py-4 font-mono text-sm font-bold uppercase">{customer.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-sm text-ink/70">{customer.email || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-sm text-ink/70">{customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-coral">
                      {customer.loyalty_points || 0}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={customer.role}
                        onChange={(e) => updateCustomerRole(customer.id, e.target.value)}
                        className="px-3 py-1 border-2 border-ink font-mono text-[11px] font-bold uppercase cursor-pointer"
                      >
                        <option value="customer">CUSTOMER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ink/70">
                      {new Date(customer.created_at).toLocaleDateString()}
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
