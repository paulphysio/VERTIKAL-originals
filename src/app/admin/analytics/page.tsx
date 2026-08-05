'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Users, ShoppingCart, Heart, TrendingUp } from 'lucide-react'

interface EventStats {
  total_events: number
  unique_users: number
  add_to_cart: number
  favorite: number
  sign_up: number
  purchase: number
  sign_in: number
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    setLoading(true)
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: events } = await supabase
      .from('events')
      .select('event_type, user_id, created_at')
      .gte('created_at', startDate.toISOString())

    if (events) {
      const uniqueUsers = new Set(events.map(e => e.user_id)).size
      
      const stats: EventStats = {
        total_events: events.length,
        unique_users: uniqueUsers,
        add_to_cart: events.filter(e => e.event_type === 'add_to_cart').length,
        favorite: events.filter(e => e.event_type === 'favorite').length,
        sign_up: events.filter(e => e.event_type === 'sign_up').length,
        purchase: events.filter(e => e.event_type === 'purchase').length,
        sign_in: events.filter(e => e.event_type === 'sign_in').length,
      }
      setStats(stats)
    }

    setLoading(false)
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="border-2 border-ink p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[11px] uppercase tracking-wide">{title}</h3>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="font-display text-4xl">{value}</p>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="font-display text-4xl uppercase">ANALYTICS</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 font-mono text-sm border-2 border-ink transition ${
                timeRange === range ? 'bg-ink text-paper' : 'bg-paper'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center font-mono text-sm py-16">LOADING...</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Events"
              value={stats.total_events}
              icon={BarChart3}
              color="text-coral"
            />
            <StatCard
              title="Unique Users"
              value={stats.unique_users}
              icon={Users}
              color="text-coral"
            />
            <StatCard
              title="Add to Cart"
              value={stats.add_to_cart}
              icon={ShoppingCart}
              color="text-coral"
            />
            <StatCard
              title="Favorites"
              value={stats.favorite}
              icon={Heart}
              color="text-coral"
            />
            <StatCard
              title="Sign Ups"
              value={stats.sign_up}
              icon={Users}
              color="text-coral"
            />
            <StatCard
              title="Purchases"
              value={stats.purchase}
              icon={TrendingUp}
              color="text-coral"
            />
            <StatCard
              title="Sign Ins"
              value={stats.sign_in}
              icon={Users}
              color="text-coral"
            />
          </div>

          <div className="border-2 border-ink p-6">
            <h2 className="font-display text-2xl uppercase mb-4">Event Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Add to Cart', value: stats.add_to_cart, color: 'bg-coral' },
                { label: 'Favorites', value: stats.favorite, color: 'bg-acid' },
                { label: 'Sign Ups', value: stats.sign_up, color: 'bg-paper border-2 border-ink' },
                { label: 'Purchases', value: stats.purchase, color: 'bg-ink' },
                { label: 'Sign Ins', value: stats.sign_in, color: 'bg-concrete' },
              ].map((item) => {
                const percentage = stats.total_events > 0 
                  ? Math.round((item.value / stats.total_events) * 100) 
                  : 0
                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-sm">{item.label}</span>
                      <span className="font-mono text-sm">{item.value} ({percentage}%)</span>
                    </div>
                    <div className="h-4 bg-concrete/20 border-2 border-ink">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 border-2 border-ink">
          <p className="font-mono text-sm text-ink/50">NO DATA YET</p>
        </div>
      )}
    </div>
  )
}
