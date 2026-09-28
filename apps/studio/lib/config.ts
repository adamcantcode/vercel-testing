/**
 * Non-secret Studio configuration. Project ID and dataset are public identifiers
 * (they ship in every browser bundle), so committing them is safe. Env vars
 * override them so the same code can point at another dataset (e.g. staging).
 *
 * Keep in sync with apps/web/lib/sanity/config.ts.
 */
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'orm5eox2'
export const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

/** Locales supported by the site. `id` must match apps/web/lib/i18n/config.ts. */
export const languages = [
  { id: 'en', title: 'English' },
  { id: 'es', title: 'Español' },
] as const

export type LanguageId = (typeof languages)[number]['id']
export const defaultLanguage: LanguageId = 'en'

/**
 * Per-language singletons use deterministic IDs like `siteSettings-en`.
 * (Never use a dot in an ID: `siteSettings.en` would make the document private.)
 */
export const singletonTypes = ['siteSettings', 'navigation'] as const
export const singletonId = (type: (typeof singletonTypes)[number], lang: LanguageId) =>
  `${type}-${lang}`
