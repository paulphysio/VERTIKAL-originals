'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search as SearchIcon, X } from 'lucide-react'
import ProductCard from '@/components/product/product-card'
import { use } from 'react'

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = use(searchParams)
  const [query, setQuery] = useState(params.q || '')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (query.length >= 2) {
      searchProducts(query)
    } else {
      setProducts([])
    }
  }, [query])

  const searchProducts = async (searchQuery: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select(`*, product_variants(*), product_images(*), categories(id, name, slug)`)
      .eq('is_active', true)
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length >= 2) {
      searchProducts(query)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b-2 border-ink px-4 py-8 sm:px-10 sm:py-12">
        <h1 className="font-display text-4xl uppercase sm:text-6xl mb-8">
          SEARCH
        </h1>
        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH PRODUCTS..."
            className="w-full pl-12 pr-12 py-4 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-5 w-5 text-ink/50 hover:text-ink" />
            </button>
          )}
        </form>
      </div>

      <div className="px-4 py-8 sm:px-10">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="font-mono text-sm">SEARCHING...</div>
          </div>
        ) : query.length < 2 ? (
          <div className="text-center py-24">
            <p className="font-mono text-sm text-ink/50">ENTER AT LEAST 2 CHARACTERS TO SEARCH</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border-2 border-ink">
            <p className="font-mono text-sm text-ink/50">NO RESULTS FOUND</p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[11px] text-ink/50 mb-6">
              {products.length} RESULT{products.length !== 1 ? 'S' : ''} FOR "{query}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} now={Date.now()} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
