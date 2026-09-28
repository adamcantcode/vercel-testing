import { ButtonLink } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { resolveHref } from '@/lib/links'
import type { BlockProps } from './types'

export function PricingTable({ block, locale, dict, index }: BlockProps<'pricingTable'>) {
  const headingId = `pricing-${index}`
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: block.currency ?? 'USD',
    maximumFractionDigits: 0,
  })

  return (
    <Section tone="muted" labelledBy={headingId}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 id={headingId} className="text-3xl font-bold tracking-tight">
          {block.heading}
        </h2>
        {block.intro && <p className="mt-4 text-lg text-ink-soft">{block.intro}</p>}
      </div>
      <ul className="mt-12 grid gap-6 lg:grid-cols-3">
        {block.tiers?.map((tier) => {
          const href = resolveHref(tier.cta?.link, locale)
          return (
            <li
              key={tier._key}
              className={`relative flex flex-col rounded-2xl bg-white p-8 ${tier.highlighted ? 'ring-2 ring-brand-600 shadow-lg' : 'ring-1 ring-line'}`}
            >
              {tier.highlighted && (
                <p className="absolute -top-3 left-8 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  {dict.pricing.recommended}
                </p>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              {tier.description && <p className="mt-2 text-sm text-ink-soft">{tier.description}</p>}
              <p className="mt-6 flex items-baseline gap-1">
                {tier.price == null ? (
                  <span className="text-3xl font-bold">{dict.pricing.contactUs}</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold">{money.format(tier.price)}</span>
                    <span className="text-sm text-ink-soft">
                      {dict.pricing.perInterval[tier.interval ?? 'month']}
                    </span>
                  </>
                )}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {tier.features?.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-brand-600">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.cta && href && (
                <ButtonLink
                  href={href}
                  variant={tier.highlighted ? 'primary' : 'secondary'}
                  trackLocation={`pricing:${tier.name}`}
                  className="mt-8 w-full"
                >
                  {tier.cta.label}
                </ButtonLink>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
