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
        console.error('Error fetching customers:', error)
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
    return <div className="text-center">Loading customers...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Customers</h1>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Loyalty Points</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{customer.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.id}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      {customer.loyalty_points || 0}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={customer.role}
                        onChange={(e) => updateCustomerRole(customer.id, e.target.value)}
                        className="px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
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
