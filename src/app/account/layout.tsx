'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, ShoppingBag, Heart, LogOut, Package, Settings } from 'lucide-react'
import SiteHeader from '@/components/layout/site-header'
import SiteFooter from '@/components/layout/site-footer'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
    }

    getUser()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="text-center font-mono text-sm">LOADING...</div>
      </div>
    )
  }

  return (
    <>
      <SiteHeader />
      <div className="px-4 py-16 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="border-2 border-ink p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-acid border-2 border-ink flex items-center justify-center">
                  <User className="h-8 w-8 text-ink" />
                </div>
                <div>
                  <h2 className="font-display text-lg uppercase">{profile?.full_name || 'User'}</h2>
                  <p className="font-mono text-[11px] text-ink/50">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-4 py-3 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
                >
                  <Package className="h-5 w-5" />
                  Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-4 py-3 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
                >
                  <Heart className="h-5 w-5" />
                  Wishlist
                </Link>
                <Link
                  href="/account/settings"
                  className="flex items-center gap-3 px-4 py-3 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 border-2 border-coral font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:text-paper transition text-left text-coral"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
