import { generatePermutations } from 'flags/next'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { PAGE_PATHS_QUERY_RESULT } from 'sanity-types'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { Container } from '@/components/ui/Container'
import { heroHeadlineFlag, precomputeFlags } from '@/lib/experiments/flags'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sanityFetch } from '@/lib/sanity/fetch'
import { getPage, getSettings } from '@/lib/sanity/loaders'
import { PAGE_PATHS_QUERY } from '@/lib/sanity/queries'
import type { BlockOf } from '@/lib/sanity/types'
import { breadcrumbLd, faqLd, JsonLd, pricingLd, webPageLd } from '@/lib/seo/jsonld'
import { buildPageMetadata } from '@/lib/seo/metadata'

type Props = PageProps<'/[code]/[locale]/[[...slug]]'>

/**
 * Pre-render every (experiment code × published page) at build time.
 * Pages published later are rendered on first request and then cached
 * (dynamicParams defaults to true), so no rebuild is needed for new content.
 */
export async function generateStaticParams() {
  const [codes, paths] = await Promise.all([
    generatePermutations([...precomputeFlags]),
    sanityFetch<PAGE_PATHS_QUERY_RESULT>({ query: PAGE_PATHS_QUERY, tags: ['page'] }),
  ])
  return codes.flatMap((code) =>
    paths
      .filter((p) => isLocale(p.language))
      .map((p) => ({
        code,
        locale: p.language!,
        slug: p.slug === 'home' ? [] : p.slug.split('/'),
      })),
  )
}

async function resolve(params: Props['params']) {
  const { code, locale, slug } = await params
  if (!isLocale(locale)) notFound()
  const result = await getPage(locale, slug?.join('/') || 'home')
  if (!result) notFound()
  return { code, locale: locale as Locale, ...result }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page, isFallback } = await resolve(params)
  const settings = await getSettings(locale)
  return buildPageMetadata({ page, settings, locale, isFallback })
}

export default async function CmsPage({ params }: Props) {
  const { code, locale, page, isFallback } = await resolve(params)
  const settings = await getSettings(locale)
  const dict = getDictionary(locale)

  // Read the variant from the precomputed code; no cookies() call, so the
  // page stays static and CDN-cacheable per variant.
  const heroHeadline = await heroHeadlineFlag(code, [...precomputeFlags])

  // Structured data describes the canonical URL, which for a fallback is the default-locale page.
  const contentLocale = isFallback && isLocale(page.language) ? page.language : locale
  const blocks = page.blocks ?? []
  const faqBlocks = blocks.filter((b): b is BlockOf<'faq'> => b._type === 'faq')
  const pricing = blocks.find((b): b is BlockOf<'pricingTable'> => b._type === 'pricingTable')

  return (
    <>
      {isFallback && (
        <div
          role="note"
          className="border-b border-amber-200 bg-amber-50 py-2 text-center text-sm text-amber-900"
        >
          <Container>{dict.fallbackNotice}</Container>
        </div>
      )}
      {/* A fallback shows default-locale content: mark its language for screen readers. */}
      <div lang={isFallback ? (page.language ?? undefined) : undefined}>
        {/* Heroes render the page H1; any other opening block gets an accessible one. */}
        {blocks[0]?._type !== 'hero' && <h1 className="sr-only">{page.title}</h1>}
        <BlockRenderer blocks={blocks} locale={locale} dict={dict} experiments={{ heroHeadline }} />
      </div>

      <JsonLd
        data={webPageLd(
          page,
          contentLocale,
          page.seo?.description ?? settings?.defaultSeo?.description ?? undefined,
        )}
      />
      <JsonLd data={breadcrumbLd(page, contentLocale, settings?.siteName ?? 'Home')} />
      <JsonLd data={faqLd(faqBlocks)} />
      {pricing && <JsonLd data={pricingLd(pricing, settings?.siteName ?? 'Acme')} />}
    </>
  )
}
