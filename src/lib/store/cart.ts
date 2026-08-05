import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { trackClientEvent } from '@/lib/actions/events'

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
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true })
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ items: [], loading: false })
      return
    }

    try {
      // Use maybeSingle() so 0 rows doesn't throw 406
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cartError) throw cartError

      if (!cart) {
        const { data: newCart, error: insertError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (insertError) throw insertError
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

    if (!user) {
      window.location.href = '/login'
      return
    }

    // Track add_to_cart event
    await trackClientEvent({
      event_type: 'add_to_cart',
      user_id: user?.id,
      metadata: {
        product_id: item.productId,
        product_name: item.name,
        variant_id: item.variantId,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
      },
      path: window.location.pathname,
    })

    try {
      let { data: cart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single()
        cart = newCart
      }

      if (!cart) return

      const { data: existingDbItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('variant_id', item.variantId)
        .maybeSingle()

      if (existingDbItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingDbItem.quantity + item.quantity })
          .eq('id', existingDbItem.id)
      } else {
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            variant_id: item.variantId,
            quantity: item.quantity,
          })
      }

      // Refresh cart from database
      await get().fetchCart()
    } catch (e) {
      console.log('Database add failed:', e)
    }
  },

  removeItem: async (variantId) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cart) return

      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
        .eq('variant_id', variantId)

      await get().fetchCart()
    } catch (e) {
      console.log('Database remove failed:', e)
    }
  },

  updateQuantity: async (variantId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(variantId)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cart) return

      const { data: cartItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('variant_id', variantId)
        .maybeSingle()

      if (cartItem) {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', cartItem.id)
      }

      await get().fetchCart()
    } catch (e) {
      console.log('Database update failed:', e)
    }
  },

  clearCart: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    set({ items: [] })

    if (!user) return

    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cart) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id)
      }
    } catch (e) {
      console.log('Database clear failed:', e)
    }
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
}))