import 'server-only'
import { cache } from 'react'
import type {
  NAVIGATION_QUERY_RESULT,
  PAGE_QUERY_RESULT,
  SETTINGS_QUERY_RESULT,
} from 'sanity-types'
import { defaultLocale, type Locale } from '../i18n/config'
import { sanityFetch } from './fetch'
import { NAVIGATION_QUERY, PAGE_QUERY, SETTINGS_QUERY } from './queries'
import type { Page } from './types'

/*
 * Loaders wrap sanityFetch with React cache(), so generateMetadata, the
 * page, and the layout can each ask for the same data without extra requests.
 */

export const getPage = cache(
  async (locale: Locale, slug: string): Promise<{ page: Page; isFallback: boolean } | null> => {
    const page = await sanityFetch<PAGE_QUERY_RESULT>({
      query: PAGE_QUERY,
      params: { slug, language: locale },
      tags: ['page'],
    })
    if (page) return { page, isFallback: false }

    // Not translated yet: serve the default-locale page so the URL still works.
    // metadata.ts canonicalises it to the default-locale URL.
    if (locale !== defaultLocale) {
      const fallback = await sanityFetch<PAGE_QUERY_RESULT>({
        query: PAGE_QUERY,
        params: { slug, language: defaultLocale },
        tags: ['page'],
      })
      if (fallback) return { page: fallback, isFallback: true }
    }
    return null
  },
)

export const getSettings = cache(async (locale: Locale) =>
  sanityFetch<SETTINGS_QUERY_RESULT>({
    query: SETTINGS_QUERY,
    params: { id: `siteSettings-${locale}` },
    tags: ['siteSettings'],
  }),
)

export const getNavigation = cache(async (locale: Locale) =>
  sanityFetch<NAVIGATION_QUERY_RESULT>({
    query: NAVIGATION_QUERY,
    params: { id: `navigation-${locale}` },
    tags: ['navigation', 'page'], // nav links resolve page slugs
  }),
)
