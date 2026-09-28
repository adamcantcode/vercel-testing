import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import type { BlockProps } from './types'

const cols = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

export function FeatureGrid({ block, locale, index }: BlockProps<'featureGrid'>) {
  const headingId = `features-${index}`
  return (
    <Section id={block.anchorId} labelledBy={headingId}>
      <div className="max-w-2xl">
        <h2 id={headingId} className="text-3xl font-bold tracking-tight">
          {block.heading}
        </h2>
        {block.intro && <p className="mt-4 text-lg text-ink-soft">{block.intro}</p>}
      </div>
      <ul className={`mt-12 grid gap-8 ${cols[block.columns ?? 3]}`}>
        {block.features?.map((feature) => (
          <li key={feature._key} className="rounded-2xl border border-line p-6">
            <span className="inline-flex rounded-lg bg-brand-50 p-2 text-brand-600">
              <Icon name={feature.icon} />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
            <RichText value={feature.body} locale={locale} className="mt-2 text-ink-soft" />
          </li>
        ))}
      </ul>
    </Section>
  )
}
