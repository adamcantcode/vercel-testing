'use client'

import { useEffect } from 'react'
import { trackEvent } from '../analytics/trackEvent'

/**
 * Fires `experiment_exposure` once when a variant actually renders. Analysts
 * join this event to conversions (generate_lead) on visitor, which is what
 * makes the experiment measurable. Assignment alone isn't exposure: a
 * visitor who never sees the hero shouldn't count.
 */
export function ExperimentExposure({
  experimentId,
  variantId,
  assignment = 'server',
}: {
  experimentId: string
  variantId: string
  assignment?: 'server' | 'client'
}) {
  useEffect(() => {
    trackEvent({
      event: 'experiment_exposure',
      experiment_id: experimentId,
      variant_id: variantId,
      assignment,
    })
  }, [experimentId, variantId, assignment])
  return null
}
