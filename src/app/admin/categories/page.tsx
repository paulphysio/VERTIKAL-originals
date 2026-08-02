'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react'
import Link from 'next/link'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ name: '', slug: '', image_url: '' })
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error.message, error.details)
      } else {
        setCategories(data || [])
      }
      setLoading(false)
    }

    fetchCategories()
  }, [supabase])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCategory) {
      // Update existing category
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          image_url: formData.image_url,
        })
        .eq('id', editingCategory.id)

      if (!error) {
        const { data } = await supabase.from('categories').select('*').order('name')
        setCategories(data || [])
        setShowModal(false)
        setEditingCategory(null)
        setFormData({ name: '', slug: '', image_url: '' })
      }
    } else {
      // Create new category
      const { error } = await supabase.from('categories').insert({
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        image_url: formData.image_url,
      })

      if (!error) {
        const { data } = await supabase.from('categories').select('*').order('name')
        setCategories(data || [])
        setShowModal(false)
        setFormData({ name: '', slug: '', image_url: '' })
      }
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (!error) {
      setCategories(categories.filter((c) => c.id !== categoryId))
    }
  }

  const openEditModal = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      image_url: category.image_url || '',
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', image_url: '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '', image_url: '' })
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `categories/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const imageUrl = await uploadImage(file)
    if (imageUrl) {
      setFormData({ ...formData, image_url: imageUrl })
    }
    setUploading(false)
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
        <h1 className="font-display text-4xl uppercase">CATEGORIES</h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-3 px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="border-2 border-ink bg-paper overflow-hidden">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-concrete flex items-center justify-center text-ink/30 font-mono text-xs">
                NO IMAGE
              </div>
            )}
            <div className="p-4">
              <h3 className="font-display text-xl uppercase mb-1">{category.name}</h3>
              <p className="font-mono text-[11px] text-ink/50 mb-4">{category.slug}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-ink bg-ink text-paper font-mono text-[11px] font-bold uppercase hover:bg-coral hover:border-coral transition"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="px-3 py-2 border-2 border-coral text-coral font-mono text-[11px] font-bold uppercase hover:bg-coral hover:text-paper transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-paper z-50 overflow-y-auto">
          <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 md:top-8 right-4 md:right-8 p-3 border-2 border-ink text-ink hover:bg-coral hover:text-paper hover:border-coral transition"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="font-display text-3xl uppercase mb-8">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Image</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
                            if (file) handleImageUpload(file)
                          }}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {uploading && <span className="font-mono text-xs text-ink/50">Uploading...</span>}
                    </div>
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover border-2 border-ink"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 sticky bottom-0 bg-paper py-4 border-t-2 border-ink mt-8">
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase hover:bg-coral hover:border-coral transition"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-4 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-concrete transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
