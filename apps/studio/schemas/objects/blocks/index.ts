import { ctaBanner } from './ctaBanner'
import { faq } from './faq'
import { featureGrid } from './featureGrid'
import { hero } from './hero'
import { leadForm } from './leadForm'
import { pricingTable } from './pricingTable'
import { testimonialCarousel } from './testimonialCarousel'

/**
 * The page-builder palette. Adding a block = add a schema here AND a component
 * in apps/web/components/blocks/registry.tsx (TypeScript flags a missing one).
 */
export const blocks = [
  hero,
  featureGrid,
  pricingTable,
  testimonialCarousel,
  ctaBanner,
  faq,
  leadForm,
]

export const blockTypeNames = blocks.map((block) => block.name)
