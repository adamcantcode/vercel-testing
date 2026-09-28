import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import type { BlockOf, BlockType } from '@/lib/sanity/types'

/** Request-scoped experiment assignments resolved by the page (see lib/experiments/flags.ts). */
export interface ExperimentAssignments {
  heroHeadline: 'control' | 'variantB'
}

/** Every block component receives exactly these props. */
export interface BlockProps<T extends BlockType> {
  block: BlockOf<T>
  locale: Locale
  dict: Dictionary
  /** Position on the page: the first block renders the page's H1. */
  index: number
  experiments: ExperimentAssignments
}
