import { defaultLocale, localeMeta, type Locale } from '../i18n/config'
import { pagePath } from '../links'
import { siteUrl } from '../site'

export interface Translation {
  language: string | null
  slug: string | null
}

/**
 * hreflang alternates for a page. Rules that trip up most sites:
 *  - Only list translations that ACTUALLY exist (never guess a URL).
 *  - Every listed URL must list the others back (reciprocal). Using the same
 *    translation.metadata doc for every language guarantees that.
 *  - x-default points at the default-locale version.
 *  - A fallback page (Spanish URL showing English content) emits none, and
 *    canonicalises to the English URL instead (see metadata.ts).
 */
export function hreflangAlternates(
  translations: Translation[] | null | undefined,
  self: { locale: Locale; slug: string },
) {
  const entries = new Map<string, string>()
  const list = translations?.length ? translations : [{ language: self.locale, slug: self.slug }]
  for (const t of list) {
    if (!t.language || !t.slug || !(t.language in localeMeta)) continue
    entries.set(
      localeMeta[t.language as Locale].hreflang,
      absoluteUrl(pagePath(t.language, t.slug)),
    )
  }
  const defaultEntry = list.find((t) => t.language === defaultLocale)
  if (defaultEntry?.slug)
    entries.set('x-default', absoluteUrl(pagePath(defaultLocale, defaultEntry.slug)))
  return Object.fromEntries(entries)
}

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`
}
