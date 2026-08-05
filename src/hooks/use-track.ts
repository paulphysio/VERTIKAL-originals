'use client'

import { useCallback } from 'react'
import { trackEvent, identifyUser, resetUser } from '@/lib/analytics'
import { getAnonymousId, getSessionId } from '@/lib/events'

export function useTrack() {
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    // Track in PostHog
    trackEvent(eventName, {
      ...properties,
      anonymous_id: getAnonymousId(),
      session_id: getSessionId(),
    })
  }, [])

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    identifyUser(userId, properties)
  }, [])

  const reset = useCallback(() => {
    resetUser()
  }, [])

  return { track, identify, reset }
}
