'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthSync() {
  const supabase = createClient()

  useEffect(() => {
    let hasSynced = false

    const syncOnAuthChange = async () => {
      const { useCartStore } = await import('@/lib/store/cart')
      const { useWishlistStore } = await import('@/lib/store/wishlist')
      
      const cartStore = useCartStore.getState()
      const wishlistStore = useWishlistStore.getState()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && !hasSynced) {
        // User is authenticated, fetch from database
        await cartStore.fetchCart()
        await wishlistStore.fetchWishlist()
        hasSynced = true
      } else if (!user) {
        // User is logged out, clear local state
        cartStore.clearCart()
        wishlistStore.clearWishlist()
        hasSynced = false
      }
    }

    // Initial sync
    syncOnAuthChange()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const { useCartStore } = await import('@/lib/store/cart')
        const { useWishlistStore } = await import('@/lib/store/wishlist')
        
        const cartStore = useCartStore.getState()
        const wishlistStore = useWishlistStore.getState()
        
        if (event === 'SIGNED_IN' && session?.user) {
          await cartStore.fetchCart()
          await wishlistStore.fetchWishlist()
          hasSynced = true
        } else if (event === 'SIGNED_OUT') {
          cartStore.clearCart()
          wishlistStore.clearWishlist()
          hasSynced = false
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return null
}
