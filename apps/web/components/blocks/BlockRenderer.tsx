import type { ComponentType } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import type { PageBlock } from '@/lib/sanity/types'
import { blockRegistry } from './registry'
import type { BlockProps, ExperimentAssignments } from './types'

/**
 * Renders the CMS page-builder array in order. An unknown `_type` (e.g. a new
 * block published in Sanity before the code that renders it is deployed) is
 * skipped in production and flagged in development, never a crash.
 */
export function BlockRenderer({
  blocks,
  locale,
  dict,
  experiments,
}: {
  blocks: PageBlock[] | null | undefined
  locale: Locale
  dict: Dictionary
  experiments: ExperimentAssignments
}) {
  return (
    <>
      {blocks?.map((block, index) => {
        const Component = blockRegistry[block._type] as
          ComponentType<BlockProps<typeof block._type>> | undefined
        if (!Component) {
          if (process.env.NODE_ENV !== 'production') {
            return (
              <div
                key={block._key}
                className="m-4 rounded border-2 border-dashed border-amber-500 p-4 text-sm text-amber-700"
              >
                No component registered for block type{' '}
                <code>{(block as { _type: string })._type}</code>
              </div>
            )
          }
          return null
        }
        return (
          <Component
            key={block._key}
            block={block}
            locale={locale}
            dict={dict}
            index={index}
            experiments={experiments}
          />
        )
      })}
    </>
  )
}
