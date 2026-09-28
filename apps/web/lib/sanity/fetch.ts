import 'server-only'
import type { QueryParams } from 'next-sanity'
import { client } from './client'

/**
 * Cache tags, one per document type. The webhook route
 * (app/api/revalidate/route.ts) calls revalidateTag(<_type>) when a document
 * of that type is published, so every page that read it regenerates.
 *
 * Type-level tags are coarse on purpose: a page's HTML also depends on OTHER
 * pages (internal link slugs, language switcher, sitemap), so invalidating
 * "all pages" on any page publish is the simplest correct choice for a
 * marketing site with dozens-to-hundreds of pages. Go per-document only when
 * regeneration cost becomes a real problem.
 */
export type CacheTag = 'page' | 'siteSettings' | 'navigation'

/** Safety net if a webhook is ever missed: content is at most 1 hour stale. */
const BACKSTOP_REVALIDATE_SECONDS = 60 * 60

export async function sanityFetch<Result>({
  query,
  params = {},
  tags,
}: {
  query: string
  params?: QueryParams
  tags: CacheTag[]
}): Promise<Result> {
  return client.fetch<Result>(query, params, {
    cache: 'force-cache',
    next: { revalidate: BACKSTOP_REVALIDATE_SECONDS, tags },
  })
}
