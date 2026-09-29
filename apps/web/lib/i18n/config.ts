/**
 * Locale registry. Every URL is prefixed (/en/..., /es/...), including the
 * default locale, so each language has one unambiguous URL for hreflang.
 * Adding a locale = add it here, in apps/studio/lib/config.ts, and add a
 * dictionary file.
 */
export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeMeta: Record<Locale, { label: string; hreflang: string; ogLocale: string }> = {
  en: { label: 'English', hreflang: 'en', ogLocale: 'en_US' },
  es: { label: 'Español', hreflang: 'es', ogLocale: 'es_ES' },
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

/** Cookie set when a visitor lands on/switches to a locale; wins over Accept-Language. */
export const LOCALE_COOKIE = 'NEXT_LOCALE'

/**
 * Minimal Accept-Language negotiation: first supported primary language by
 * q-weight. (Use @formatjs/intl-localematcher once you add regional
 * locales like en-GB / es-MX.)
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)
  return (ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined) ?? defaultLocale
}
