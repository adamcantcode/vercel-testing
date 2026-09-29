'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { bucket, VISITOR_COOKIE } from './bucket'
import { ExperimentExposure } from './ExperimentExposure'

/**
 * CLIENT-SIDE experiment, shown for contrast with the server-side
 * (precomputed) approach in flags.ts.
 *
 * The server always renders `control` (it's static HTML); after hydration we
 * read the visitor cookie and may swap to `variantB`. That swap is the
 * "flicker" client-side testing tools are known for, and it can shift layout
 * (hurting CLS). Acceptable for below-the-fold, same-size changes like a
 * button style; use precomputed flags for anything above the fold.
 */
export function ClientExperiment({
  experimentId,
  control,
  variantB,
  split = 50,
}: {
  experimentId: string
  control: ReactNode
  variantB: ReactNode
  /** Percent of visitors who get variant B. */
  split?: number
}) {
  const [variant, setVariant] = useState<'control' | 'variantB' | null>(null)

  useEffect(() => {
    const visitorId = document.cookie.match(new RegExp(`(?:^|; )${VISITOR_COOKIE}=([^;]+)`))?.[1]
    // Reading a browser-only cookie after mount is exactly the external sync
    // this effect exists for; the one-time state update is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVariant(visitorId && bucket(visitorId, experimentId) < split ? 'variantB' : 'control')
  }, [experimentId, split])

  return (
    <>
      {variant === 'variantB' ? variantB : control}
      {variant && (
        <ExperimentExposure experimentId={experimentId} variantId={variant} assignment="client" />
      )}
    </>
  )
}
