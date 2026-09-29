import type { Metadata } from 'next'
import type { SETTINGS_QUERY_RESULT } from 'sanity-types'
import { localeMeta, locales, type Locale } from '../i18n/config'
import { pagePath } from '../links'
import type { Page } from '../sanity/types'
import { isProductionDeployment } from '../site'
import { absoluteUrl, hreflangAlternates } from './hreflang'

/**
 * Build Next.js Metadata for a CMS page. Precedence for each field:
 * page SEO override → page content → Site Settings default.
 */
export function buildPageMetadata({
  page,
  settings,
  locale,
  isFallback,
}: {
  page: Page
  settings: SETTINGS_QUERY_RESULT
  locale: Locale
  isFallback: boolean
}): Metadata {
  const isHome = page.slug === 'home'
  // Homepages rarely want the literal title "Home": default to "Site | Tagline".
  const title =
    page.seo?.title ||
    (isHome && settings?.siteName
      ? [settings.siteName, settings.tagline].filter(Boolean).join(' | ')
      : page.title)
  const description = page.seo?.description || settings?.defaultSeo?.description || undefined

  // A fallback render (e.g. /es/pricing showing English) canonicalises to the
  // real English URL so search engines don't index duplicate content.
  const canonicalPath = pagePath(isFallback ? (page.language ?? locale) : locale, page.slug)
  const canonical = absoluteUrl(canonicalPath)

  const ogImage =
    page.seo?.ogImage ||
    settings?.defaultSeo?.ogImage ||
    `/api/og?${new URLSearchParams({ title, site: settings?.siteName ?? '' })}`

  const noIndex = !isProductionDeployment || page.seo?.noIndex === true

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages: isFallback
        ? undefined
        : hreflangAlternates(page.translations, { locale, slug: page.slug }),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: settings?.siteName ?? undefined,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].ogLocale),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  }
}
