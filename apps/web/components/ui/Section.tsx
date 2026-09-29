import type { ReactNode } from 'react'
import { Container } from './Container'

/**
 * Every block renders inside a Section, so vertical rhythm and tone
 * backgrounds are consistent no matter how editors stack blocks.
 */
const tones = {
  default: 'bg-surface text-ink',
  muted: 'bg-surface-muted text-ink',
  brand: 'bg-brand-600 text-white',
  dark: 'bg-ink text-white',
} as const

export function Section({
  children,
  id,
  tone = 'default',
  className = '',
  labelledBy,
}: {
  children: ReactNode
  id?: string | null
  tone?: keyof typeof tones
  className?: string
  labelledBy?: string
}) {
  return (
    <section
      id={id ?? undefined}
      aria-labelledby={labelledBy}
      className={`py-16 sm:py-24 ${tones[tone]} ${className}`}
    >
      <Container>{children}</Container>
    </section>
  )
}
