import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from './config'

/**
 * Server-side read client.
 *
 * `useCdn: false` is deliberate. Next.js already caches every response (see
 * fetch.ts), so Sanity only gets called on a cache miss or after a webhook
 * revalidation. Going straight to the live API guarantees that post-webhook
 * fetch sees the just-published content instead of a stale CDN edge.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
})
