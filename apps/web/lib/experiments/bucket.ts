/**
 * Deterministic bucketing: the same visitor always lands in the same variant
 * of the same experiment, with no database and no network call, so it's safe
 * to run in the proxy on every request.
 *
 * Hashing `experimentKey:visitorId` (not just visitorId) keeps experiments
 * independent: being in B for one test doesn't predict your arm in another.
 */
export function bucket(visitorId: string, experimentKey: string): number {
  // FNV-1a 32-bit. Not cryptographic; it only needs to be uniform and fast.
  let hash = 0x811c9dc5
  const input = `${experimentKey}:${visitorId}`
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) % 100
}

/** Cookie holding the anonymous visitor ID used for bucketing. */
export const VISITOR_COOKIE = 'visitor_id'
