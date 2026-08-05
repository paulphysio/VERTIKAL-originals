import { createClient } from '@/lib/supabase/server'
import { PostHog } from 'posthog-node'

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST
})

export interface EventData {
  event_type: string
  user_id?: string
  anonymous_id?: string
  session_id?: string
  metadata?: Record<string, any>
  path?: string
  referrer?: string
  user_agent?: string
  ip?: string
}

/**
 * Log an event to both PostHog and the events table (server-side)
 * This is more reliable than client-side tracking as it can't be blocked by ad blockers
 */
export async function logEvent(data: EventData) {
  const supabase = await createClient()
  
  try {
    // Track in PostHog (server-side)
    if (data.user_id) {
      posthog.capture({
        distinctId: data.user_id,
        event: data.event_type,
        properties: {
          ...data.metadata,
          anonymous_id: data.anonymous_id,
          session_id: data.session_id,
          path: data.path,
          referrer: data.referrer,
        }
      })
    }

    // Track in custom events table
    const { error } = await supabase
      .from('events')
      .insert({
        event_type: data.event_type,
        user_id: data.user_id || null,
        anonymous_id: data.anonymous_id || null,
        session_id: data.session_id || null,
        metadata: data.metadata || {},
        path: data.path || null,
        referrer: data.referrer || null,
        user_agent: data.user_agent || null,
        ip: data.ip || null,
      })

    if (error) {
      console.error('Error logging event to database:', error)
    }

    // Flush PostHog events
    await posthog.shutdown()
  } catch (error) {
    console.error('Error in logEvent:', error)
  }
}

/**
 * Get or generate anonymous ID for tracking
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return ''
  
  let anonId = localStorage.getItem('anon_id')
  if (!anonId) {
    anonId = crypto.randomUUID()
    localStorage.setItem('anon_id', anonId)
  }
  return anonId
}

/**
 * Get session ID for tracking
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}
