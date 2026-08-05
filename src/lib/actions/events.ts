'use server'

import { logEvent } from '@/lib/events'
import { getAnonymousId, getSessionId } from '@/lib/events'

export interface ClientEventData {
  event_type: string
  user_id?: string
  metadata?: Record<string, any>
  path?: string
}

/**
 * Server action to log events from client components
 * This bridges client-side tracking with the server-side event logging system
 */
export async function trackClientEvent(data: ClientEventData) {
  const anonymous_id = getAnonymousId()
  const session_id = getSessionId()

  await logEvent({
    event_type: data.event_type,
    user_id: data.user_id,
    anonymous_id,
    session_id,
    metadata: data.metadata,
    path: data.path,
  })
}
