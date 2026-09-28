import type { ComponentType } from 'react'
import type { BlockType } from '@/lib/sanity/types'
import { CtaBanner } from './CtaBanner'
import { Faq } from './Faq'
import { FeatureGrid } from './FeatureGrid'
import { Hero } from './Hero'
import { LeadForm } from './LeadForm'
import { PricingTable } from './PricingTable'
import { TestimonialCarousel } from './TestimonialCarousel'
import type { BlockProps } from './types'

/**
 * _type → component. The mapped type makes this exhaustive: add a block to
 * the Sanity schema, run `pnpm typegen`, and TypeScript errors here until a
 * component is registered. That's the contract between CMS and code.
 */
export const blockRegistry: { [T in BlockType]: ComponentType<BlockProps<T>> } = {
  hero: Hero,
  featureGrid: FeatureGrid,
  pricingTable: PricingTable,
  testimonialCarousel: TestimonialCarousel,
  ctaBanner: CtaBanner,
  faq: Faq,
  leadForm: LeadForm,
}
