'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'

export default function AdminShippingZonesPage() {
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    states: '',
    fee: '0',
    estimated_days: '3-5',
  })
  const supabase = createClient()

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
      states: formData.states.split(',').map(s => s.trim()).filter(Boolean),
      fee: Number(formData.fee),
      estimated_days: formData.estimated_days,
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
      setFormData({ name: '', states: '', fee: '0', estimated_days: '3-5' })
      fetchZones()
    } else {
      alert(`Failed to save shipping zone: ${error.message}`)
    }
    setLoading(false)
  }

  const handleEdit = (zone: any) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      states: Array.isArray(zone.states) ? zone.states.join(', ') : zone.states || '',
      fee: zone.fee.toString(),
      estimated_days: zone.estimated_days,
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
    setFormData({ name: '', states: '', fee: '0', estimated_days: '3-5' })
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
                  </div>
                  <p className="font-mono text-sm text-ink/70 mb-2">
                    States: {Array.isArray(zone.states) ? zone.states.join(', ') : zone.states || 'N/A'}
                  </p>
                  <div className="flex gap-4 font-mono text-sm">
                    <span className="text-coral font-bold">₦{zone.fee.toLocaleString()}</span>
                    <span className="text-ink/50">{zone.estimated_days} days</span>
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
          <div className="bg-paper border-2 border-ink w-full max-w-lg">
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
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">States (comma separated)</label>
                  <input
                    type="text"
                    value={formData.states}
                    onChange={(e) => setFormData({ ...formData, states: e.target.value })}
                    placeholder="Lagos, Abuja, Port Harcourt"
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    required
                  />
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
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Estimated Delivery Days</label>
                  <input
                    type="text"
                    value={formData.estimated_days}
                    onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                    placeholder="3-5"
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    required
                  />
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
