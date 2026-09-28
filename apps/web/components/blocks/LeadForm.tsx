import { Section } from '@/components/ui/Section'
import { LeadFormClient } from './LeadFormClient'
import type { BlockProps } from './types'

export function LeadForm({ block, locale, dict, index }: BlockProps<'leadForm'>) {
  const headingId = `lead-${index}`
  return (
    <Section id={block.anchorId} tone="muted" labelledBy={headingId}>
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 id={headingId} className="text-3xl font-bold tracking-tight">
            {block.heading}
          </h2>
          {block.intro && <p className="mt-4 text-lg text-ink-soft">{block.intro}</p>}
        </div>
        <LeadFormClient
          formId={block.hubspotFormId ?? 'default'}
          locale={locale}
          dict={dict.form}
          submitLabel={block.submitLabel ?? 'Submit'}
          successMessage={block.successMessage ?? ''}
        />
      </div>
    </Section>
  )
}
