import posthog from 'posthog-js'

// Custom event tracking function
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  posthog.capture(eventName, properties)
}

// Identify user
export function identifyUser(userId: string, properties?: Record<string, any>) {
  posthog.identify(userId, properties)
}

// Reset user (on logout)
export function resetUser() {
  posthog.reset()
}
