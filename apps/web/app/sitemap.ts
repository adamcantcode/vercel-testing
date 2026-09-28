import type { MetadataRoute } from 'next'
import type { PAGE_PATHS_QUERY_RESULT } from 'sanity-types'
import { isLocale } from '@/lib/i18n/config'
import { pagePath } from '@/lib/links'
import { sanityFetch } from '@/lib/sanity/fetch'
import { PAGE_PATHS_QUERY } from '@/lib/sanity/queries'
import { absoluteUrl, hreflangAlternates } from '@/lib/seo/hreflang'

/**
 * One entry per published page per language, each carrying its hreflang
 * alternates (the sitemap-based hreflang method, which Google accepts in
 * addition to the <link> tags in <head>). Regenerates with the `page` tag.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await sanityFetch<PAGE_PATHS_QUERY_RESULT>({
    query: PAGE_PATHS_QUERY,
    tags: ['page'],
  })
  return pages
    .filter((p) => isLocale(p.language) && !p.noIndex)
    .map((p) => ({
      url: absoluteUrl(pagePath(p.language!, p.slug)),
      lastModified: p._updatedAt,
      alternates: {
        languages: hreflangAlternates(p.translations, {
          locale: p.language as 'en' | 'es',
          slug: p.slug,
        }),
      },
    }))
}
