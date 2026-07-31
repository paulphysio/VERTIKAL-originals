'use client'

import { useState, useEffect } from 'react'
import { useWishlistStore } from '@/lib/store/wishlist'
import { useCartStore } from '@/lib/store/cart'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const wishlist = useWishlistStore((state) => state.items)
  const loading = useWishlistStore((state) => state.loading)
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)
  const removeFromWishlist = useWishlistStore((state) => state.removeItem)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleAddToCart = (item: any) => {
    addItem({
      variantId: item.productId, // Using productId as variantId for wishlist items
      productId: item.productId,
      name: item.name,
      size: 'M', // Default size
      color: 'Black', // Default color
      price: item.price,
      image: item.image,
      quantity: 1,
    })
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
      <h1 className="font-display text-4xl uppercase mb-8">Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-24 w-24 mx-auto text-ink/20 mb-4" />
          <h2 className="font-display text-2xl uppercase mb-2">Your wishlist is empty</h2>
          <p className="font-mono text-sm text-ink/50 mb-8">
            Save items you love by clicking the heart icon on any product.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            return (
              <div key={item.id} className="border-2 border-ink overflow-hidden group">
                <Link href={`/products/${item.productId}`}>
                  <div className="relative aspect-square bg-concrete/20">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-sm text-ink/50">
                        NO IMAGE
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        removeFromWishlist(item.productId)
                      }}
                      className="absolute top-2 right-2 p-2 bg-paper border-2 border-ink hover:border-coral hover:bg-coral hover:text-paper transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-bold text-sm mb-2 hover:text-coral transition">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="font-mono text-lg font-bold mb-3">
                    ₦{Math.round(item.price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
