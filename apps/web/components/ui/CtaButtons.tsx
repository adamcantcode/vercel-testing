import type { Locale } from '@/lib/i18n/config'
import { resolveHref } from '@/lib/links'
import type { Cta } from '@/lib/sanity/types'
import { ButtonLink, type ButtonVariant } from './Button'

/** Renders CMS CTAs, skipping any whose link can't be resolved (e.g. unpublished target). */
export function CtaButtons({
  ctas,
  locale,
  location,
  inverse = false,
}: {
  ctas: Cta[] | null | undefined
  locale: Locale
  location: string
  inverse?: boolean
}) {
  if (!ctas?.length) return null
  return (
    <div className="flex flex-wrap gap-3">
      {ctas.map((cta) => {
        const href = resolveHref(cta.link, locale)
        if (!href) return null
        const variant: ButtonVariant =
          inverse && cta.variant !== 'secondary' ? 'inverse' : (cta.variant ?? 'primary')
        return (
          <ButtonLink key={cta._key} href={href} variant={variant} trackLocation={location}>
            {cta.label}
          </ButtonLink>
        )
      })}
    </div>
  )
}
