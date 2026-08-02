'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Store, CreditCard, Bell, Shield, Package } from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    storeName: 'VERTIKAL originals',
    storeEmail: '',
    storePhone: '',
    currency: 'NGN',
    shippingFee: '2000',
    freeShippingThreshold: '50000',
    paystackPublicKey: '',
    enableEmailNotifications: true,
    enableSmsNotifications: false,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .single()
      
      if (data) {
        setSettings(data)
      }
    }
    fetchSettings()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('settings')
      .upsert(settings)

    if (!error) {
      alert('Settings saved successfully!')
    } else {
      alert('Failed to save settings')
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="font-display text-4xl uppercase mb-8">SETTINGS</h1>

      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* Store Settings */}
        <div className="border-2 border-ink p-6 bg-paper">
          <h2 className="font-display text-2xl uppercase mb-6 flex items-center gap-3">
            <Store className="h-6 w-6" />
            Store Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Store Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Store Phone</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              >
                <option value="NGN">NGN (Nigerian Naira)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="border-2 border-ink p-6 bg-paper">
          <h2 className="font-display text-2xl uppercase mb-6 flex items-center gap-3">
            <Package className="h-6 w-6" />
            Shipping Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Default Shipping Fee (₦)</label>
              <input
                type="number"
                value={settings.shippingFee}
                onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="border-2 border-ink p-6 bg-paper">
          <h2 className="font-display text-2xl uppercase mb-6 flex items-center gap-3">
            <CreditCard className="h-6 w-6" />
            Payment Settings
          </h2>
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase mb-2">Paystack Public Key</label>
            <input
              type="text"
              value={settings.paystackPublicKey}
              onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
              placeholder="pk_xxxxxxxxxxxx"
              className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
            />
            <p className="font-mono text-[10px] text-ink/50 mt-2">Enter your Paystack public key for payment processing</p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="border-2 border-ink p-6 bg-paper">
          <h2 className="font-display text-2xl uppercase mb-6 flex items-center gap-3">
            <Bell className="h-6 w-6" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 font-mono text-sm">
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                className="accent-coral w-5 h-5"
              />
              <span className="uppercase font-bold">Enable Email Notifications</span>
            </label>
            <label className="flex items-center gap-3 font-mono text-sm">
              <input
                type="checkbox"
                checked={settings.enableSmsNotifications}
                onChange={(e) => setSettings({ ...settings, enableSmsNotifications: e.target.checked })}
                className="accent-coral w-5 h-5"
              />
              <span className="uppercase font-bold">Enable SMS Notifications</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed transition"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
