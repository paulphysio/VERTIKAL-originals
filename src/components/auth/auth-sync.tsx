'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthSync() {
  const supabase = createClient()

  useEffect(() => {
    let hasMerged = false

    const syncOnAuthChange = async () => {
      const { useCartStore } = await import('@/lib/store/cart')
      const { useWishlistStore } = await import('@/lib/store/wishlist')
      
      const cartStore = useCartStore.getState()
      const wishlistStore = useWishlistStore.getState()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && !hasMerged) {
        // User is authenticated, merge guest data
        await cartStore.mergeGuestCart()
        await wishlistStore.mergeGuestWishlist()
        hasMerged = true
      } else if (!user) {
        // User is logged out, load from localStorage
        cartStore.loadFromLocalStorage()
        wishlistStore.loadFromLocalStorage()
        hasMerged = false
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
          await cartStore.mergeGuestCart()
          await wishlistStore.mergeGuestWishlist()
          hasMerged = true
        } else if (event === 'SIGNED_OUT') {
          cartStore.loadFromLocalStorage()
          wishlistStore.loadFromLocalStorage()
          hasMerged = false
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return null
}
