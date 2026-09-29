import Image from 'next/image'
import { CtaButtons } from '@/components/ui/CtaButtons'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { ExperimentExposure } from '@/lib/experiments/ExperimentExposure'
import type { BlockProps } from './types'

export function Hero({ block, locale, index, experiments }: BlockProps<'hero'>) {
  // Experiment: only runs when marketing has written a variant heading.
  const inExperiment = Boolean(block.headingVariantB)
  const showVariantB = inExperiment && experiments.heroHeadline === 'variantB'
  const heading = showVariantB ? block.headingVariantB : block.heading

  // Exactly one H1 per page: the hero is the H1 only when it's the first block.
  const Heading = index === 0 ? 'h1' : 'h2'
  const headingId = `hero-${index}`

  return (
    <Section tone="muted" labelledBy={headingId} className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          {block.eyebrow && (
            <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
              {block.eyebrow}
            </p>
          )}
          <Heading
            id={headingId}
            className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          >
            {heading}
          </Heading>
          <RichText
            value={block.body}
            locale={locale}
            className="mt-6 max-w-xl text-lg text-ink-soft"
          />
          <div className="mt-8">
            <CtaButtons ctas={block.ctas} locale={locale} location="hero" />
          </div>
        </div>
        {block.image?.url ? (
          <Image
            src={`${block.image.url}?w=1200&auto=format`}
            alt={block.image.alt ?? ''}
            width={block.image.width ?? 1200}
            height={block.image.height ?? 800}
            placeholder={block.image.lqip ? 'blur' : 'empty'}
            blurDataURL={block.image.lqip ?? undefined}
            priority={index === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="rounded-2xl shadow-xl"
          />
        ) : (
          // Placeholder art so a hero without an image still looks intentional.
          <div
            aria-hidden="true"
            className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-ink shadow-xl"
          />
        )}
      </div>
      {inExperiment && (
        <ExperimentExposure experimentId="hero-headline" variantId={experiments.heroHeadline} />
      )}
    </Section>
  )
}
