/**
 * The analytics contract. Every event the site can emit is listed here, so
 * GTM triggers, GA4 custom dimensions, and warehouse models have one source
 * of truth. Adding an event = add it to this union; TypeScript then forces
 * every trackEvent() call to send the right fields.
 *
 * Names follow GA4 recommended events where one exists (generate_lead).
 */
export type AnalyticsEvent =
  | {
      event: 'cta_click'
      cta_label: string
      cta_href: string
      /** Which block/region the CTA lives in, e.g. "hero", "header", "pricing:Pro". */
      cta_location: string
    }
  | {
      event: 'generate_lead'
      form_id: string
      locale: string
    }
  | {
      event: 'form_error'
      form_id: string
      /** Field names that failed validation. Never send field VALUES (PII). */
      error_fields: string
    }
  | {
      event: 'experiment_exposure'
      experiment_id: string
      variant_id: string
      /** "server" = precomputed static variant; "client" = decided after hydration. */
      assignment: 'server' | 'client'
    }

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}
