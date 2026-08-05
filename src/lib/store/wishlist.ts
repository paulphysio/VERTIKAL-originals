import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { trackClientEvent } from '@/lib/actions/events'

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
  mergeGuestWishlist: () => Promise<void>
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  clearLocalStorage: () => void
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,
  
  saveToLocalStorage: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_wishlist', JSON.stringify(get().items))
    }
  },
  
  loadFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guest_wishlist')
      if (stored) {
        try {
          set({ items: JSON.parse(stored) })
        } catch (e) {
          console.error('Error loading wishlist from localStorage:', e)
        }
      }
    }
  },
  
  clearLocalStorage: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_wishlist')
    }
  },
  
  fetchWishlist: async () => {
    set({ loading: true })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      get().loadFromLocalStorage()
      set({ loading: false })
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
      window.location.href = '/login'
      return
    }

    // Track favorite event to Supabase events table (via server action)
    await trackClientEvent({
      event_type: 'favorite',
      user_id: user?.id,
      metadata: {
        product_id: item.productId,
        product_name: item.name,
        price: item.price,
      },
      path: window.location.pathname,
    })

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
      get().saveToLocalStorage()
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
  
  clearWishlist: () => {
    set({ items: [] })
    get().clearLocalStorage()
  },
  
  getItemCount: () => {
    return get().items.length
  },
  
  mergeGuestWishlist: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    // Load from localStorage first to ensure we have the guest items
    get().loadFromLocalStorage()
    
    const localItems = get().items
    if (localItems.length === 0) return
    
    // Merge local items with database
    for (const item of localItems) {
      const { data: existingItem } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', item.productId)
        .single()

      if (!existingItem) {
        await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            product_id: item.productId,
          })
      }
    }

    // Clear local storage and refresh wishlist
    get().clearLocalStorage()
    await get().fetchWishlist()
  },
}))
