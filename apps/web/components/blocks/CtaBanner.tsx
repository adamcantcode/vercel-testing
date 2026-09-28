import { CtaButtons } from '@/components/ui/CtaButtons'
import { Section } from '@/components/ui/Section'
import { ClientExperiment } from '@/lib/experiments/ClientExperiment'
import type { BlockProps } from './types'

const toneMap = { brand: 'brand', dark: 'dark', light: 'muted' } as const

export function CtaBanner({ block, locale, index }: BlockProps<'ctaBanner'>) {
  const tone = toneMap[block.tone ?? 'brand']
  const inverse = tone !== 'muted'
  const headingId = `cta-${index}`
  const buttons = (
    <CtaButtons ctas={block.ctas} locale={locale} location="cta-banner" inverse={inverse} />
  )

  return (
    <Section tone={tone} labelledBy={headingId}>
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 id={headingId} className="text-3xl font-bold tracking-tight">
            {block.heading}
          </h2>
          {block.body && (
            <p className={`mt-4 text-lg ${inverse ? 'text-white/80' : 'text-ink-soft'}`}>
              {block.body}
            </p>
          )}
        </div>
        {/* Client-side experiment demo: below the fold, same footprint → flicker is tolerable. */}
        <ClientExperiment
          experimentId="cta-banner-layout"
          control={buttons}
          variantB={<div className="rounded-xl bg-white/10 p-2">{buttons}</div>}
        />
      </div>
    </Section>
  )
}
