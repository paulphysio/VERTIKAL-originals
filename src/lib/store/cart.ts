import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface CartItem {
  id: string
  variantId: string
  productId: string
  name: string
  size: string
  color: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  fetchCart: () => Promise<void>
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  removeItem: (variantId: string) => Promise<void>
  updateQuantity: (variantId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotal: () => number
  getItemCount: () => number
  mergeGuestCart: () => Promise<void>
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  clearLocalStorage: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  
  saveToLocalStorage: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_cart', JSON.stringify(get().items))
    }
  },
  
  loadFromLocalStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guest_cart')
      if (stored) {
        try {
          set({ items: JSON.parse(stored) })
        } catch (e) {
          console.error('Error loading cart from localStorage:', e)
        }
      }
    }
  },
  
  clearLocalStorage: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_cart')
    }
  },
  
  fetchCart: async () => {
    set({ loading: true })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Always load from localStorage first for now
    get().loadFromLocalStorage()
    
    if (!user) {
      set({ loading: false })
      return
    }

    // Try to sync from database in background
    try {
      let { data: cart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!cart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single()
        cart = newCart
      }

      if (!cart) {
        set({ loading: false })
        return
      }

      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product_variants(
            *,
            products(*, product_images(*))
          )
        `)
        .eq('cart_id', cart.id)

      if (!error && cartItems && cartItems.length > 0) {
        const items: CartItem[] = cartItems.map((item: any) => ({
          id: item.id,
          variantId: item.variant_id,
          productId: item.product_variants?.product_id || '',
          name: item.product_variants?.products?.name || '',
          size: item.product_variants?.size || '',
          color: item.product_variants?.color || '',
          price: item.product_variants?.price || 0,
          image: item.product_variants?.products?.product_images?.[0]?.url || '',
          quantity: item.quantity,
        }))
        set({ items, loading: false })
      } else {
        set({ loading: false })
      }
    } catch (e) {
      console.log('Database fetch failed (using localStorage):', e)
      set({ loading: false })
    }
  },
  
  addItem: async (item) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Always use localStorage for now (database issue)
    const existingItem = get().items.find((i) => i.variantId === item.variantId)
    if (existingItem) {
      set({
        items: get().items.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      })
    } else {
      set({ items: [...get().items, { ...item, id: crypto.randomUUID() }] })
    }
    get().saveToLocalStorage()
    
    // Try database sync in background (won't block UI)
    if (user) {
      try {
        let { data: cart } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!cart) {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select()
            .single()
          cart = newCart
        }

        if (cart) {
          const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('variant_id', item.variantId)
            .single()

          if (existingItem) {
            await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + item.quantity })
              .eq('id', existingItem.id)
          } else {
            await supabase
              .from('cart_items')
              .insert({
                cart_id: cart.id,
                variant_id: item.variantId,
                quantity: item.quantity,
              })
          }
        }
      } catch (e) {
        console.log('Database sync failed (using localStorage):', e)
      }
    }
  },
  
  removeItem: async (variantId) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      set({ items: get().items.filter((i) => i.variantId !== variantId) })
      get().saveToLocalStorage()
      return
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!cart) return

    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)

    set({ items: get().items.filter((i) => i.variantId !== variantId) })
  },
  
  updateQuantity: async (variantId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(variantId)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      set({
        items: get().items.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
        ),
      })
      get().saveToLocalStorage()
      return
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!cart) return

    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)
      .single()

    if (cartItem) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItem.id)
    }

    set({
      items: get().items.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      ),
    })
  },
  
  clearCart: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ items: [] })
      get().clearLocalStorage()
      return
    }

    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (cart) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
    }

    set({ items: [] })
  },
  
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
  
  mergeGuestCart: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return
    
    // Load from localStorage first to ensure we have the guest items
    get().loadFromLocalStorage()
    
    const localItems = get().items
    if (localItems.length === 0) return
    
    // Get or create cart for user
    let { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single()
      cart = newCart
    }

    if (!cart) return

    // Merge local items with database
    for (const item of localItems) {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('variant_id', item.variantId)
        .single()

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + item.quantity })
          .eq('id', existingItem.id)
      } else {
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            variant_id: item.variantId,
            quantity: item.quantity,
          })
      }
    }

    // Clear local storage and refresh cart
    get().clearLocalStorage()
    await get().fetchCart()
  },
}))
