/**
 * Google Consent Mode v2 defaults. MUST render before GTM loads: tags read
 * these values on startup. Everything is denied until a consent banner
 * (Phase 2) calls gtag('consent', 'update', {...}).
 *
 * Denied ≠ no data: GA4 still receives cookieless pings for modeling, but no
 * cookies are set and no ad identifiers are used.
 */
export function ConsentDefaults() {
  const script = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});`
  return <script id="consent-defaults" dangerouslySetInnerHTML={{ __html: script }} />
}
