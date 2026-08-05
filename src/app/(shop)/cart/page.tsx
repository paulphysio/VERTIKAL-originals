'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSettings } from '@/lib/actions/settings'
import { getShippingZones } from '@/lib/queries'
import { getAllStates, getLocalGovernments, getCities } from 'nigeria-geodata'

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotal, clearCart, fetchCart, loading } = useCartStore()
  const [settings, setSettings] = useState<any>(null)
  const [shippingZones, setShippingZones] = useState<any[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('Nigeria')
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedLga, setSelectedLga] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  useEffect(() => {
    const fetchData = async () => {
      const [settingsData, zonesData] = await Promise.all([
        getSettings(),
        getShippingZones()
      ])
      setSettings(settingsData)
      setShippingZones(zonesData)
      // Load saved location from localStorage
      const savedLocation = localStorage.getItem('selected_shipping_location')
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation)
          setSelectedCountry(location.country || 'Nigeria')
          setSelectedState(location.state || '')
          setSelectedLga(location.lga || '')
          setSelectedCity(location.city || '')
        } catch (e) {
          console.error('Error parsing saved location:', e)
        }
      }
    }
    fetchData()
  }, [])

  // Save selected location to localStorage when it changes
  useEffect(() => {
    if (selectedState || selectedLga) {
      localStorage.setItem('selected_shipping_location', JSON.stringify({
        country: selectedCountry,
        state: selectedState,
        lga: selectedLga,
        city: selectedCity
      }))
    }
  }, [selectedCountry, selectedState, selectedLga, selectedCity])

  // Get states, LGAs, and cities
  const states = getAllStates()
  const lgas = selectedState ? getLocalGovernments(selectedState) : []
  const cities = selectedState && selectedLga ? getCities(selectedState, selectedLga) : []

  // Find matching shipping zone based on Country + State + LGA
  const selectedZoneData = shippingZones.find(z => 
    z.country === selectedCountry && 
    z.state === selectedState && 
    z.lga === selectedLga
  )

  if (loading) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="text-center font-mono text-sm">LOADING...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl uppercase mb-4">YOUR BAG IS EMPTY</h1>
          <p className="text-ink/70 mb-8 font-mono text-sm">
            Looks like you haven't added any items yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
          >
            SHOP NOW →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-16 sm:px-10">
      <h1 className="font-display text-4xl uppercase mb-8">YOUR BAG</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border-2 border-ink">
              <div className="w-24 h-24 bg-concrete/20 overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-ink/50">
                    NO IMAGE
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-bold hover:text-coral transition"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="font-mono text-[11px] text-coral hover:underline"
                  >
                    REMOVE
                  </button>
                </div>

                <p className="font-mono text-[11px] text-ink/50 mb-2 uppercase">
                  {item.size} • {item.color}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 border-2 border-ink font-mono text-sm hover:bg-ink hover:text-paper transition"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 border-2 border-ink font-mono text-sm hover:bg-ink hover:text-paper transition"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-mono font-bold">
                    ₦{Math.round(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="font-mono text-[11px] text-coral hover:underline mt-4"
          >
            CLEAR BAG
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border-2 border-ink p-6 sticky top-24">
            <h2 className="font-display text-2xl uppercase mb-6">ORDER SUMMARY</h2>

            {/* Shipping Location Selection */}
            <div className="mb-6 space-y-3">
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Select Your Location</label>
              
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedState('')
                  setSelectedLga('')
                  setSelectedCity('')
                }}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral bg-paper"
              >
                <option value="Nigeria">Nigeria</option>
              </select>

              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value)
                  setSelectedLga('')
                  setSelectedCity('')
                }}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral bg-paper"
                disabled={!selectedCountry}
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

              <select
                value={selectedLga}
                onChange={(e) => {
                  setSelectedLga(e.target.value)
                  setSelectedCity('')
                }}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral bg-paper"
                disabled={!selectedState}
              >
                <option value="">Select LGA</option>
                {lgas.map((lga: string) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral bg-paper"
                disabled={!selectedLga}
              >
                <option value="">Select City (Optional)</option>
                {cities.map((city: string) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {selectedZoneData && (
                <div className="mt-2 font-mono text-[11px] text-ink/70">
                  <span className="text-coral font-bold">₦{selectedZoneData.fee?.toLocaleString()}</span>
                  {' • '}
                  {selectedZoneData.delivery_time_min}-{selectedZoneData.delivery_time_max} days delivery
                </div>
              )}
              
              {!selectedZoneData && selectedLga && (
                <div className="mt-2 font-mono text-[11px] text-coral">
                  No shipping zone available for this LGA
                </div>
              )}
            </div>

            {(() => {
              const subtotal = Number(getTotal())
              const shippingFee = Number(selectedZoneData?.fee) || Number(settings?.shippingFee) || 1000
              const shipping = shippingFee
              const total = subtotal + shipping

              return (
                <div className="space-y-4 mb-6 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink/70">SUBTOTAL</span>
                    <span>₦{Math.round(subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/70">SHIPPING</span>
                    <span>₦{Math.round(shipping).toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 border-ink pt-4 flex justify-between font-bold text-base">
                    <span>TOTAL</span>
                    <span className="text-coral">
                      ₦{Math.round(total).toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })()}

            <Link
              href="/checkout"
              className="block w-full text-center px-6 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
            >
              CHECKOUT →
            </Link>

            <Link
              href="/products"
              className="block w-full text-center px-6 py-4 mt-3 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
