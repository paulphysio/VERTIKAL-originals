'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    base_price: '',
    is_active: true,
    is_featured: false,
  })
  const [variants, setVariants] = useState([
    { size: '', color: '', color_hex: '', price: '', stock: '', image_url: '' },
  ])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      setCategories(data || [])
    }
    fetchCategories()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', color_hex: '', price: '', stock: '', image_url: '' }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          description: formData.description,
          category_id: formData.category_id || null,
          base_price: parseFloat(formData.base_price),
          is_active: formData.is_active,
          is_featured: formData.is_featured,
        })
        .select()
        .single()

      if (productError) throw productError

      // Create variants
      const variantData = variants
        .filter((v) => v.size && v.color)
        .map((v) => ({
          product_id: product.id,
          size: v.size,
          color: v.color,
          color_hex: v.color_hex,
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0,
          image_url: v.image_url,
        }))

      if (variantData.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantData)

        if (variantError) throw variantError
      }

      router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => router.push('/admin/products')}
        className="flex items-center gap-2 text-ink hover:text-coral mb-6 font-mono text-sm font-bold uppercase transition"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Products
      </button>

      <h1 className="font-display text-4xl uppercase mb-8">Add New Product</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="border-2 border-ink p-6 bg-paper mb-6">
          <h2 className="font-display text-2xl uppercase mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="Auto-generated if empty"
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Base Price (₦) *</label>
              <input
                type="text"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-mono text-[11px] font-bold uppercase mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="accent-coral"
                />
                <span className="uppercase font-bold">Active</span>
              </label>
              <label className="flex items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="accent-coral"
                />
                <span className="uppercase font-bold">Featured</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-2 border-ink p-6 bg-paper mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl uppercase">Product Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 px-4 py-2 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase hover:bg-coral hover:border-coral transition"
            >
              <Plus className="h-4 w-4" />
              Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="border-2 border-ink p-4 mb-4 relative bg-paper">
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="absolute top-2 right-2 text-coral hover:bg-coral hover:text-paper transition"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Size</label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                    placeholder="S, M, L, etc."
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Color</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                    placeholder="Red, Blue, etc."
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Color Hex</label>
                  <input
                    type="text"
                    value={variant.color_hex}
                    onChange={(e) => handleVariantChange(index, 'color_hex', e.target.value)}
                    placeholder="#FF0000"
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Price Override</label>
                  <input
                    type="text"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                    placeholder="Leave empty for base price"
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Stock</label>
                  <input
                    type="text"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Image URL</label>
                  <input
                    type="text"
                    value={variant.image_url}
                    onChange={(e) => handleVariantChange(index, 'image_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase hover:bg-coral hover:border-coral disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-concrete transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
