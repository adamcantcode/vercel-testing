/**
 * Public Sanity identifiers. These aren't secrets (they're visible in every
 * API request the browser could make), so they're committed with env overrides.
 * Keep in sync with apps/studio/lib/config.ts.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'orm5eox2'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

/** Pin the API version so Content Lake behavior changes never surprise us. */
export const apiVersion = '2025-01-01'

export const studioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://acme-vercel-testing.sanity.studio'
