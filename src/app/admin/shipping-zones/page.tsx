'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'
import { getAllStates, getLocalGovernments, getCities } from 'nigeria-geodata'

export default function AdminShippingZonesPage() {
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState<any>(null)
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedLga, setSelectedLga] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    country: 'Nigeria',
    state: '',
    lga: '',
    fee: '0',
    delivery_time_min: '3',
    delivery_time_max: '5',
    is_active: true,
  })
  const supabase = createClient()
  
  // Get Nigerian states from nigeria-geodata
  const states = getAllStates()
  
  // Get LGAs for selected state using nigeria-geodata
  const lgas = selectedState ? getLocalGovernments(selectedState) : []

  useEffect(() => {
    fetchZones()
  }, [supabase])

  const fetchZones = async () => {
    const { data, error } = await supabase
      .from('shipping_zones')
      .select('*')

    if (error) {
      console.error('Error fetching shipping zones:', error)
    } else {
      setZones(data || [])
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const zoneData = {
      name: formData.name,
      country: formData.country,
      state: formData.state,
      lga: formData.lga,
      fee: Number(formData.fee),
      delivery_time_min: Number(formData.delivery_time_min),
      delivery_time_max: Number(formData.delivery_time_max),
      is_active: formData.is_active,
    }

    let error
    if (editingZone) {
      const result = await supabase
        .from('shipping_zones')
        .update(zoneData)
        .eq('id', editingZone.id)
      error = result.error
    } else {
      const result = await supabase
        .from('shipping_zones')
        .insert(zoneData)
      error = result.error
    }

    if (!error) {
      setShowModal(false)
      setEditingZone(null)
      setFormData({ name: '', country: 'Nigeria', state: '', lga: '', fee: '0', delivery_time_min: '3', delivery_time_max: '5', is_active: true })
      fetchZones()
    } else {
      alert(`Failed to save shipping zone: ${error.message}`)
    }
    setLoading(false)
  }

  const handleEdit = (zone: any) => {
    setEditingZone(zone)
    setSelectedState(zone.state || '')
    setSelectedLga(zone.lga || '')
    setFormData({
      name: zone.name,
      country: zone.country || 'Nigeria',
      state: zone.state || '',
      lga: zone.lga || '',
      fee: zone.fee.toString(),
      delivery_time_min: zone.delivery_time_min?.toString() || '3',
      delivery_time_max: zone.delivery_time_max?.toString() || '5',
      is_active: zone.is_active ?? true,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return

    const { error } = await supabase
      .from('shipping_zones')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchZones()
    } else {
      alert('Failed to delete shipping zone')
    }
  }

  const handleAdd = () => {
    setEditingZone(null)
    setSelectedState('')
    setSelectedLga('')
    setFormData({ name: '', country: 'Nigeria', state: '', lga: '', fee: '0', delivery_time_min: '3', delivery_time_max: '5', is_active: true })
    setShowModal(true)
  }

  if (loading && zones.length === 0) {
    return (
      <div className="text-center font-mono text-sm py-16">
        LOADING...
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="font-display text-4xl uppercase">SHIPPING ZONES</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-3 px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
        >
          <Plus className="h-5 w-5" />
          ADD ZONE
        </button>
      </div>

      {/* Zones List */}
      <div className="border-2 border-ink bg-paper overflow-hidden">
        {zones.length === 0 ? (
          <div className="p-8 text-center font-mono text-sm text-ink/50">
            NO SHIPPING ZONES FOUND
          </div>
        ) : (
          <div className="divide-y divide-ink">
            {zones.map((zone) => (
              <div key={zone.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-5 w-5 text-ink/50" />
                    <h3 className="font-display text-xl uppercase">{zone.name}</h3>
                    {!zone.is_active && (
                      <span className="px-2 py-1 bg-concrete text-ink/50 font-mono text-[10px] uppercase">Inactive</span>
                    )}
                  </div>
                  <p className="font-mono text-sm text-ink/70 mb-2">
                    {zone.country} {zone.state && `• ${zone.state}`} {zone.city && `• ${zone.city}`}
                  </p>
                  <div className="flex gap-4 font-mono text-sm">
                    <span className="text-coral font-bold">₦{zone.fee.toLocaleString()}</span>
                    <span className="text-ink/50">
                      {zone.delivery_time_min}-{zone.delivery_time_max} days
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(zone)}
                    className="px-4 py-2 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-ink hover:text-paper transition"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(zone.id)}
                    className="px-4 py-2 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-coral hover:border-coral transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/80 flex items-center justify-center p-4 z-50">
          <div className="bg-paper border-2 border-ink w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="font-display text-2xl uppercase mb-6">
                {editingZone ? 'EDIT ZONE' : 'ADD ZONE'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Zone Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">State/Region</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      const newState = e.target.value
                      setSelectedState(newState)
                      setSelectedLga('')
                      setFormData({ ...formData, state: newState, lga: '' })
                    }}
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state: any, index: number) => {
                      const stateName = typeof state === 'string' ? state : state.state || state.name
                      return (
                        <option key={index} value={stateName}>
                          {stateName}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">LGA (Optional)</label>
                  <select
                    value={formData.lga}
                    onChange={(e) => {
                      const newLga = e.target.value
                      setSelectedLga(newLga)
                      setFormData({ ...formData, lga: newLga, name: newLga || formData.name })
                    }}
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga: string) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Shipping Fee (₦)</label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase mb-2">Min Delivery (days)</label>
                    <input
                      type="number"
                      value={formData.delivery_time_min}
                      onChange={(e) => setFormData({ ...formData, delivery_time_min: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase mb-2">Max Delivery (days)</label>
                    <input
                      type="number"
                      value={formData.delivery_time_max}
                      onChange={(e) => setFormData({ ...formData, delivery_time_max: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 border-2 border-ink"
                  />
                  <label htmlFor="is_active" className="font-mono text-sm">Active</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'SAVING...' : 'SAVE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-ink hover:text-paper transition"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
