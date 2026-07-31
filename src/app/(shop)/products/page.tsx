'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductVariant, ProductImage } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import ProductCard from '@/components/product/product-card'

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; featured?: string; search?: string }>
}) {
  const params = use(searchParams)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const addItem = useCartStore((state) => state.addItem)

  // Fetch products from database
  useState(() => {
    const fetchProducts = async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_variants(*),
          product_images(*),
          categories(id, name, slug)
        `)
        .eq('is_active', true)

      if (params.featured === 'true') {
        query = query.eq('is_featured', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center font-mono text-sm">LOADING...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between border-b-2 border-ink px-4 py-8 sm:px-10 sm:py-10">
        <h1 className="font-display text-3xl uppercase sm:text-5xl">
          {params.featured ? 'Featured' : 'Shop'}
        </h1>
        <span className="font-mono text-[11px] text-ink/50">
          {products.length} ITEMS
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-mono text-sm text-ink/50">NO PRODUCTS FOUND</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 border-b-2 border-ink lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} now={Date.now()} />
          ))}
        </div>
      )}
    </div>
  )
}
