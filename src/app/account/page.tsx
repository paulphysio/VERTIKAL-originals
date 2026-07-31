'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, Award } from 'lucide-react'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
        })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [supabase])

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } else {
      setProfile({ ...profile, ...formData })
      setEditing(false)
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
      <h1 className="font-display text-4xl uppercase mb-8">MY PROFILE</h1>

      <div className="border-2 border-ink p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl uppercase">Personal Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-acid border-2 border-ink flex items-center justify-center">
              <User className="h-10 w-10 text-ink" />
            </div>
            <div>
              <h3 className="font-display text-xl uppercase">{profile?.full_name || 'User'}</h3>
              <p className="font-mono text-[11px] text-ink/50 uppercase">{profile?.role}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-bold mb-2 uppercase">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral transition"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold mb-2 uppercase">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral transition"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-ink/50" />
                <span className="font-mono text-sm">{profile?.full_name || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-ink/50" />
                <span className="font-mono text-sm">{profile?.phone || 'Not set'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loyalty Points */}
      <div className="border-2 border-ink p-6">
        <h2 className="font-display text-2xl uppercase mb-4">Loyalty Points</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-acid border-2 border-ink flex items-center justify-center">
            <Award className="h-8 w-8 text-ink" />
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-coral">{profile?.loyalty_points || 0}</p>
            <p className="font-mono text-[11px] text-ink/50 uppercase">Points earned</p>
          </div>
        </div>
        <p className="mt-4 font-mono text-sm text-ink/70">
          Earn 1 point for every ₦10 spent. Redeem points at checkout for discounts.
        </p>
      </div>
    </div>
  )
}
