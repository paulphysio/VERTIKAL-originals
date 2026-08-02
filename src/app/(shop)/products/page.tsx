'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/product/product-card'

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; featured?: string; search?: string }>
}) {
  const params = use(searchParams)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [searchQuery, setSearchQuery] = useState(params.search || '')
  const [sortBy, setSortBy] = useState('newest')
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: products }, { data: categories }] = await Promise.all([
        supabase
          .from('products')
          .select(`*, product_variants(*), product_images(*), categories(id, name, slug)`)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name')
      ])

      if (products) setProducts(products)
      if (categories) setCategories(categories)
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  // Set initial category from URL
  useEffect(() => {
    if (params.category && categories.length > 0) {
      const category = categories.find((cat) => cat.slug === params.category)
      if (category) {
        setSelectedCategory(category.id)
      }
    }
  }, [params.category, categories])

  useEffect(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory)
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(p => p.base_price >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.base_price <= parseFloat(priceRange.max))
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.categories?.name?.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.base_price - b.base_price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.base_price - a.base_price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, priceRange, searchQuery, sortBy])

  const clearFilters = () => {
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setSearchQuery('')
    setSortBy('newest')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-sm">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-ink px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl uppercase sm:text-4xl">SHOP</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-ink font-mono text-xs font-bold uppercase hover:bg-coral hover:text-paper hover:border-coral transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink/50" />
          <input
            type="text"
            placeholder="SEARCH PRODUCTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
          />
        </div>
      </div>

      {/* Filters Panel (Mobile Drawer) */}
      {showFilters && (
        <div className="border-b-2 border-ink bg-paper p-4 sm:hidden">
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="₦0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="₦99999"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-concrete transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:block w-64 border-r-2 border-ink p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg uppercase mb-4 pb-2 border-b-2 border-ink">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Category</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={selectedCategory === ''}
                        onChange={() => setSelectedCategory('')}
                        className="accent-coral"
                      />
                      All
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 font-mono text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="accent-coral"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Price Range (₦)</label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-concrete transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[11px] text-ink/50">
              {filteredProducts.length} ITEMS
            </span>
            <div className="hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 border-2 border-ink">
              <p className="font-mono text-sm text-ink/50">NO PRODUCTS FOUND</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-concrete transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} now={Date.now()} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
