import Link from 'next/link'
import type { ReactNode } from 'react'
import { isExternalHref } from '@/lib/links'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  secondary:
    'bg-white text-ink ring-1 ring-inset ring-line hover:bg-surface-muted focus-visible:outline-brand-600',
  inverse: 'bg-white text-brand-700 hover:bg-brand-50 focus-visible:outline-white',
} as const

export type ButtonVariant = keyof typeof variants

export const buttonClass = (variant: ButtonVariant = 'primary') =>
  `inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]}`

/**
 * Link styled as a button. `trackLocation` opts it into the delegated
 * cta_click tracking (lib/analytics/ClickTracker.tsx).
 */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  trackLocation,
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  trackLocation?: string
  className?: string
}) {
  const track = trackLocation ? { 'data-track': 'cta', 'data-track-location': trackLocation } : {}
  const cls = `${buttonClass(variant)} ${className}`
  if (isExternalHref(href)) {
    return (
      <a href={href} className={cls} rel="noopener noreferrer" target="_blank" {...track}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={cls} {...track}>
      {children}
    </Link>
  )
}
