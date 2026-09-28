'use client'

import { useEffect } from 'react'
import { trackEvent } from './trackEvent'

/**
 * One delegated listener instead of an onClick on every button. Any element
 * with `data-track="cta"` reports a cta_click. This keeps block components
 * as Server Components (no client JS just to track clicks).
 *
 *   <a data-track="cta" data-track-location="hero" href="/en/pricing">…</a>
 */
export function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track="cta"]')
      if (!el) return
      trackEvent({
        event: 'cta_click',
        cta_label: el.dataset.trackLabel || el.textContent?.trim() || '',
        cta_href: el.getAttribute('href') || '',
        cta_location: el.dataset.trackLocation || 'unknown',
      })
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}
