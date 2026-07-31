import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface WishlistItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  addedAt: string
}

interface WishlistStore {
  items: WishlistItem[]
  loading: boolean
  fetchWishlist: () => Promise<void>
  addItem: (item: Omit<WishlistItem, 'id'>) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  
  fetchWishlist: async () => {
    set({ loading: true })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ loading: false, items: [] })
      return
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products(*, product_images(*))
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching wishlist:', error)
      set({ loading: false })
      return
    }

    const items: WishlistItem[] = (data || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      name: item.products?.name || '',
      price: item.products?.base_price || 0,
      image: item.products?.product_images?.[0]?.url || '',
      addedAt: item.created_at,
    }))

    set({ items, loading: false })
  },
  
  addItem: async (item) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      set({ items: [...get().items, { ...item, id: crypto.randomUUID() }] })
      return
    }

    const { error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        product_id: item.productId,
      })

    if (error) {
      console.error('Error adding to wishlist:', error)
      return
    }

    // Refresh wishlist after adding
    get().fetchWishlist()
  },
  
  removeItem: async (productId) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      set({ items: get().items.filter((i) => i.productId !== productId) })
      return
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing from wishlist:', error)
      return
    }

    set({ items: get().items.filter((i) => i.productId !== productId) })
  },
  
  isInWishlist: (productId) => {
    return get().items.some((i) => i.productId === productId)
  },
  
  clearWishlist: () => set({ items: [] }),
  
  getItemCount: () => {
    return get().items.length
  },
}))
