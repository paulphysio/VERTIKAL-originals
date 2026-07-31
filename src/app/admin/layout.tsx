'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings, LogOut, Menu, X } from 'lucide-react'
import SiteHeader from '@/components/layout/site-header'
import SiteFooter from '@/components/layout/site-footer'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      setProfile(profile)
    }

    checkAdmin()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center font-mono text-sm">LOADING...</div>
      </div>
    )
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-paper">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-ink/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="px-4 py-16 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="border-2 border-ink p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-lg uppercase">Admin</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-paper transition"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t-2 border-ink">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 border-2 border-coral font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:text-paper transition text-left text-coral"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="md:col-span-3">{children}</div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
