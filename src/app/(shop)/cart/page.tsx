'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart, fetchCart, loading } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

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

            <div className="space-y-4 mb-6 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-ink/70">SUBTOTAL</span>
                <span>₦{Math.round(getTotal()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/70">SHIPPING</span>
                <span>{getTotal() >= 10000 ? 'FREE' : '₦1,000'}</span>
              </div>
              <div className="border-t-2 border-ink pt-4 flex justify-between font-bold text-base">
                <span>TOTAL</span>
                <span className="text-coral">
                  ₦{Math.round(getTotal() + (getTotal() >= 10000 ? 0 : 1000)).toLocaleString()}
                </span>
              </div>
            </div>

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
