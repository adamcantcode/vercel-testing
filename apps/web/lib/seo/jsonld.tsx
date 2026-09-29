import { toPlainText } from '@portabletext/react'
import type {
  BreadcrumbList,
  FAQPage,
  Organization,
  Product,
  Thing,
  WebPage,
  WebSite,
  WithContext,
} from 'schema-dts'
import type { SETTINGS_QUERY_RESULT } from 'sanity-types'
import type { Locale } from '../i18n/config'
import { pagePath } from '../links'
import type { BlockOf, Page } from '../sanity/types'
import { siteUrl } from '../site'
import { absoluteUrl } from './hreflang'

/*
 * schema.org structured data, typed with schema-dts so invalid properties are
 * compile errors. This is the main AEO (answer-engine optimisation) lever:
 * LLM crawlers and Google's AI features lean on explicit entities (who you
 * are, what you sell, what it costs, common questions) rather than inferring
 * them from layout.
 *
 * Everything is derived from CMS content, so it can never drift from what
 * the page actually shows (a Google requirement for FAQ/Product markup).
 */

const orgId = `${siteUrl}/#organization`
const websiteId = `${siteUrl}/#website`

export function organizationLd(settings: SETTINGS_QUERY_RESULT): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId,
    name: settings?.siteName ?? 'Acme',
    legalName: settings?.organization?.legalName ?? undefined,
    url: siteUrl,
    logo: settings?.organization?.logo ?? undefined,
    email: settings?.organization?.contactEmail ?? undefined,
    sameAs: settings?.organization?.sameAs ?? undefined,
  }
}

export function websiteLd(settings: SETTINGS_QUERY_RESULT, locale: Locale): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    url: siteUrl,
    name: settings?.siteName ?? 'Acme',
    description: settings?.tagline ?? undefined,
    inLanguage: locale,
    publisher: { '@id': orgId },
  }
}

export function webPageLd(page: Page, locale: Locale, description?: string): WithContext<WebPage> {
  const url = absoluteUrl(pagePath(locale, page.slug))
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.seo?.title || page.title,
    description,
    inLanguage: locale,
    isPartOf: { '@id': websiteId },
    dateModified: page._updatedAt,
  }
}

export function breadcrumbLd(
  page: Page,
  locale: Locale,
  homeLabel: string,
): WithContext<BreadcrumbList> | null {
  if (page.slug === 'home') return null
  const segments = page.slug.split('/')
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel,
        item: absoluteUrl(pagePath(locale, 'home')),
      },
      ...segments.map((_, i) => ({
        '@type': 'ListItem' as const,
        position: i + 2,
        name: i === segments.length - 1 ? page.title : segments[i],
        item: absoluteUrl(pagePath(locale, segments.slice(0, i + 1).join('/'))),
      })),
    ],
  }
}

/** One FAQPage for all FAQ blocks on the page. */
export function faqLd(blocks: BlockOf<'faq'>[]): WithContext<FAQPage> | null {
  const items = blocks.flatMap((b) => b.items ?? [])
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: toPlainText(item.answer) },
    })),
  }
}

/** Each priced tier becomes an Offer on a single Product (the SaaS plan). */
export function pricingLd(
  block: BlockOf<'pricingTable'>,
  siteName: string,
): WithContext<Product> | null {
  const offers = (block.tiers ?? [])
    .filter((t) => t.price != null)
    .map((t) => ({
      '@type': 'Offer' as const,
      name: t.name,
      price: t.price!,
      priceCurrency: block.currency ?? 'USD',
      description: t.description ?? undefined,
      availability: 'https://schema.org/InStock' as const,
    }))
  if (!offers.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: siteName,
    brand: { '@id': orgId },
    offers,
  }
}

/**
 * Render JSON-LD safely. Escaping "<" prevents a CMS string containing
 * "</script>" from breaking out of the tag (an XSS vector).
 */
export function JsonLd({ data }: { data: WithContext<Thing> | null | undefined }) {
  if (!data) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
