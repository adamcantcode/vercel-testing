/**
 * Absolute site origin, used for canonical URLs, hreflang, sitemap, and
 * JSON-LD (all of which must be absolute).
 *
 * Priority: explicit SITE_URL → Vercel production domain → this deployment's
 * URL (previews) → localhost.
 */
export const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')
).replace(/\/$/, '')

/**
 * True only on the production deployment. Previews and local dev are always
 * noindex so search engines never see staging URLs.
 */
export const isProductionDeployment = process.env.VERCEL_ENV === 'production'
