import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import type { BlockProps } from './types'

/**
 * Native <details>/<summary>: accessible and zero-JS, and, crucially for
 * AEO, the answers are in the HTML, not injected on click, so crawlers
 * (including LLM crawlers that don't run JS) can read them. The same content
 * is emitted as FAQPage JSON-LD by the page.
 */
export function Faq({ block, locale, index }: BlockProps<'faq'>) {
  const headingId = `faq-${index}`
  return (
    <Section labelledBy={headingId}>
      <div className="mx-auto max-w-3xl">
        <h2 id={headingId} className="text-3xl font-bold tracking-tight">
          {block.heading}
        </h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {block.items?.map((item) => (
            <details key={item._key} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden="true" className="text-brand-600 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <RichText value={item.answer} locale={locale} className="mt-4 text-ink-soft" />
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
