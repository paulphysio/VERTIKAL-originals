'use client'

import Link from 'next/link'
import { ShoppingCart, User, Search, Menu } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const itemCount = useCartStore((state) => state.getItemCount())

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Initial user check:', user)
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user)
      setUser(session?.user ?? null)
      
      // Force a page refresh on auth state changes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        window.location.reload()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            VERTIKAL originals
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
              Products
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}

            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
