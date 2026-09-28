import type { Locale } from './i18n/config'

/** Shape produced by the LINK projection in lib/sanity/queries.ts. */
export interface SanityLink {
  type: 'internal' | 'external'
  external: string | null
  anchor: string | null
  internal: { slug: string; language: string | null } | null
}

/** The slug "home" is the locale root. */
export function pagePath(locale: string, slug: string | null | undefined): string {
  return !slug || slug === 'home' ? `/${locale}` : `/${locale}/${slug}`
}

/**
 * Turn a CMS link into an href. Internal links resolve from the referenced
 * page, so renaming a slug in Sanity updates every link to it automatically.
 */
export function resolveHref(
  link: SanityLink | null | undefined,
  fallbackLocale: Locale,
): string | null {
  if (!link) return null
  const hash = link.anchor ? `#${link.anchor}` : ''
  if (link.type === 'external') return link.external ? `${link.external}${hash}` : null
  if (!link.internal) return hash || null
  return `${pagePath(link.internal.language ?? fallbackLocale, link.internal.slug)}${hash}`
}

export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}
