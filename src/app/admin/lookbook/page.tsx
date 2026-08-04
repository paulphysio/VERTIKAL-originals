'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, X } from 'lucide-react'

interface Post {
  id: string
  image_url: string
  caption: string | null
  created_at: string
  likes?: number
  comments?: number
}

export default function AdminLookbookPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
  })
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data: posts } = await supabase
      .from('lookbook_posts')
      .select(`
        *,
        lookbook_likes(id),
        lookbook_comments(id)
      `)
      .order('created_at', { ascending: false })

    if (posts) {
      const postsWithCounts = posts.map((post: any) => ({
        ...post,
        likes: post.lookbook_likes?.length || 0,
        comments: post.lookbook_comments?.length || 0
      }))
      setPosts(postsWithCounts)
    }
    setLoading(false)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `lookbook/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('lookbook-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      alert('Failed to upload image')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('lookbook-images')
      .getPublicUrl(filePath)

    setFormData({ ...formData, image_url: publicUrl })
    setUploading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('lookbook_posts')
      .insert({
        image_url: formData.image_url,
        caption: formData.caption,
        posted_by: user.id,
      })

    if (!error) {
      setShowModal(false)
      setFormData({ image_url: '', caption: '' })
      fetchPosts()
    } else {
      alert('Failed to create post')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('lookbook_posts')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchPosts()
    } else {
      alert('Failed to delete post')
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="text-center font-mono text-sm py-16">
        LOADING...
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="font-display text-4xl uppercase">LOOKBOOK</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-3 px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
        >
          <Plus className="h-5 w-5" />
          ADD POST
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.length === 0 ? (
          <div className="col-span-full p-8 text-center border-2 border-ink">
            <p className="font-mono text-sm text-ink/50">NO POSTS YET</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border-2 border-ink overflow-hidden group">
              <div className="aspect-square bg-concrete/20 relative">
                <img
                  src={post.image_url}
                  alt="Lookbook post"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDelete(post.id)}
                  className="absolute top-2 right-2 p-2 bg-paper border-2 border-ink hover:border-coral hover:bg-coral hover:text-paper transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3">
                <div className="flex gap-3 font-mono text-[11px] text-ink/50">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/80 flex items-center justify-center p-4 z-50">
          <div className="bg-paper border-2 border-ink w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl uppercase">ADD POST</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-concrete transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      disabled={uploading}
                      className="w-full font-mono text-sm"
                    />
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full aspect-square object-cover border-2 border-ink"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase mb-2">Caption</label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Write a caption..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || uploading || !formData.image_url}
                    className="flex-1 px-6 py-3 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed transition"
                  >
                    {uploading ? 'UPLOADING...' : loading ? 'SAVING...' : 'POST'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-ink font-mono text-sm font-bold uppercase hover:bg-ink hover:text-paper transition"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
