import type { AnalyticsEvent } from './events'

/**
 * Push a typed event to the GTM dataLayer. GTM (not this code) decides which
 * tools receive it (GA4, ad pixels, …) and respects Consent Mode, so adding
 * a vendor never requires a code deploy.
 *
 * With no GTM container configured (local dev, previews) events are logged
 * to the console instead so you can still see instrumentation working.
 */
export function trackEvent(payload: AnalyticsEvent): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
  if (process.env.NODE_ENV !== 'production' || !process.env.NEXT_PUBLIC_GTM_ID) {
    console.info('[analytics]', payload)
  }
}
