import { flag } from 'flags/next'
import { bucket, VISITOR_COOKIE } from './bucket'

/**
 * Experiment & feature-flag declarations (Vercel Flags SDK).
 *
 * This is a "no provider" setup: decide() buckets locally. To move to
 * Statsig/LaunchDarkly/GrowthBook later, swap decide() for that provider's
 * adapter. Nothing else in the app changes.
 */

type Entities = { visitorId?: string }

/** Everything a flag's decide() can know about the visitor. */
const identify = ({
  cookies,
}: {
  cookies: { get: (name: string) => { value: string } | undefined }
}) => ({
  visitorId: cookies.get(VISITOR_COOKIE)?.value,
})

export const heroHeadlineFlag = flag<'control' | 'variantB', Entities>({
  key: 'hero-headline',
  description: 'Homepage hero: default heading vs the CMS "Heading, variant B" field. 50/50 split.',
  defaultValue: 'control',
  options: [
    { value: 'control', label: 'Control (default heading)' },
    { value: 'variantB', label: 'Variant B (CMS variant heading)' },
  ],
  identify,
  decide({ entities }) {
    if (!entities?.visitorId) return 'control'
    return bucket(entities.visitorId, 'hero-headline') < 50 ? 'variantB' : 'control'
  },
})

/**
 * Flags evaluated in the proxy and baked into the URL as a signed code
 * (/[code]/[locale]/...). Each combination is a separate static page, so
 * variants are served from the CDN with zero flicker and zero client JS.
 *
 * Keep this list short: pages built = permutations × locales × slugs.
 */
export const precomputeFlags = [heroHeadlineFlag] as const
