'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, X, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
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
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: products }, { data: categories }] = await Promise.all([
        supabase
          .from('products')
          .select(`*, categories!category_id(name), product_variants(*)`)
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').eq('is_active', true)
      ])

      if (products) setProducts(products)
      if (categories) setCategories(categories)
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (!error) {
      setProducts(products.filter((p) => p.id !== productId))
    } else {
      alert('Failed to delete product')
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', productId)

    if (!error) {
      setProducts(products.map((p) => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ))
    }
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      category_id: product.category_id || '',
      base_price: product.base_price.toString(),
      is_active: product.is_active,
      is_featured: product.is_featured || false,
    })
    setVariants(
      product.product_variants?.length > 0
        ? product.product_variants
        : [{ size: '', color: '', color_hex: '', price: '', stock: '', image_url: '' }]
    )
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      category_id: '',
      base_price: '',
      is_active: true,
      is_featured: false,
    })
    setVariants([{ size: '', color: '', color_hex: '', price: '', stock: '', image_url: '' }])
  }

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

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleImageUpload = async (index: number, file: File) => {
    setUploading(true)
    const imageUrl = await uploadImage(file)
    if (imageUrl) {
      handleVariantChange(index, 'image_url', imageUrl)
    }
    setUploading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          category_id: formData.category_id || null,
          base_price: parseFloat(formData.base_price),
          is_active: formData.is_active,
          is_featured: formData.is_featured,
        })
        .eq('id', editingProduct.id)

      if (productError) throw productError

      // Update variants - delete old and insert new
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', editingProduct.id)

      const variantData = variants
        .filter((v) => v.size && v.color)
        .map((v) => ({
          product_id: editingProduct.id,
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

      // Refresh products
      const { data } = await supabase
        .from('products')
        .select(`*, categories!category_id(name), product_variants(*)`)
        .order('created_at', { ascending: false })

      setProducts(data || [])
      closeEditModal()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center font-mono text-sm py-16">
        LOADING...
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="font-display text-4xl uppercase">PRODUCTS</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-3 px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="border-2 border-ink p-6 bg-paper mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink/50" />
          <input
            type="text"
            placeholder="SEARCH PRODUCTS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="border-2 border-ink bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="font-mono text-[11px] font-bold uppercase text-ink/50 border-b-2 border-ink">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center font-mono text-sm text-ink/50">
                    NO PRODUCTS FOUND
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = product.product_variants?.reduce(
                    (sum: number, v: any) => sum + v.stock,
                    0
                  ) || 0

                  return (
                    <tr key={product.id} className="hover:bg-concrete/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-concrete border-2 border-ink overflow-hidden">
                            {product.product_variants?.[0]?.image_url ? (
                              <img
                                src={product.product_variants[0].image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs font-mono">
                                NO IMG
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-mono text-sm font-bold uppercase">{product.name}</p>
                            <p className="font-mono text-[11px] text-ink/50">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-ink/70">
                        {product.categories?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm font-bold">{formatPrice(product.base_price)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-mono text-sm font-bold ${totalStock === 0 ? 'text-coral' : ''}`}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleProductStatus(product.id, product.is_active)}
                          className={`px-3 py-1 border-2 border-ink font-mono text-[11px] font-bold uppercase cursor-pointer transition ${
                            product.is_active
                              ? 'bg-acid text-ink hover:bg-coral hover:text-paper'
                              : 'bg-concrete text-ink hover:bg-ink hover:text-paper'
                          }`}
                        >
                          {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-ink hover:text-coral hover:bg-coral/10 border-2 border-ink transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 text-coral hover:bg-coral hover:text-paper border-2 border-ink transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-paper z-50 overflow-y-auto">
          <div className="min-h-screen p-4 md:p-8 relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 md:top-8 right-4 md:right-8 p-3 border-2 border-ink text-ink hover:bg-coral hover:text-paper hover:border-coral transition"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="font-display text-3xl uppercase mb-8">Edit Product</h2>

            <form onSubmit={handleUpdate}>
              <div className="space-y-8 max-w-6xl mx-auto">
                {/* Basic Information */}
                <div>
                  <h3 className="font-display text-xl uppercase mb-4 pb-2 border-b-2 border-ink">Basic Information</h3>
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
                        type="number"
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
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 font-mono text-sm">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="accent-coral w-5 h-5"
                        />
                        <span className="uppercase font-bold">Active</span>
                      </label>
                      <label className="flex items-center gap-2 font-mono text-sm">
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleInputChange}
                          className="accent-coral w-5 h-5"
                        />
                        <span className="uppercase font-bold">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Product Variants */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-ink">
                    <h3 className="font-display text-xl uppercase">Product Variants</h3>
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
                    <div key={index} className="border-2 border-ink p-6 mb-4 relative bg-paper">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="absolute top-4 right-4 text-coral hover:bg-coral hover:text-paper transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            placeholder="Leave empty for base price"
                            className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[11px] font-bold uppercase mb-2">Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[11px] font-bold uppercase mb-2">Image</label>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={variant.image_url || ''}
                              onChange={(e) => handleVariantChange(index, 'image_url', e.target.value)}
                              placeholder="Paste image URL..."
                              className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                            />
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 px-4 py-2 border-2 border-ink font-mono text-xs font-bold uppercase cursor-pointer hover:bg-concrete transition">
                                <Upload className="h-4 w-4" />
                                Upload Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(index, file)
                                  }}
                                  className="hidden"
                                  disabled={uploading}
                                />
                              </label>
                              {uploading && <span className="font-mono text-xs text-ink/50">Uploading...</span>}
                            </div>
                            {variant.image_url && (
                              <img
                                src={variant.image_url}
                                alt="Preview"
                                className="w-full h-32 object-cover border-2 border-ink"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 sticky bottom-0 bg-paper py-4 border-t-2 border-ink">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-8 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase hover:bg-coral hover:border-coral disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed transition"
                  >
                    {uploading ? 'Saving...' : 'Update Product'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-8 py-4 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-concrete transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
