'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import type { BlockProps } from './types'

/**
 * Accessible, dependency-free carousel: native CSS scroll-snap does the
 * motion (works without JS, respects reduced motion); JS only adds the
 * prev/next buttons. No autoplay: moving content fails WCAG 2.2.2 unless
 * it can be paused.
 */
export function TestimonialCarousel({
  block,
  dict,
  index,
}: Omit<BlockProps<'testimonialCarousel'>, 'experiments'>) {
  const track = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)
  const items = block.testimonials ?? []
  const headingId = `testimonials-${index}`

  function go(to: number) {
    const el = track.current
    if (!el) return
    const next = (to + items.length) % items.length
    el.scrollTo({ left: el.clientWidth * next, behavior: 'smooth' })
    setActive(next)
  }

  return (
    <section
      aria-labelledby={headingId}
      aria-roledescription="carousel"
      className="bg-surface py-16 sm:py-24"
    >
      <Container>
        <h2 id={headingId} className="text-center text-3xl font-bold tracking-tight">
          {block.heading || 'Testimonials'}
        </h2>
        <ul
          ref={track}
          onScroll={(e) =>
            setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
          }
          className="mt-12 flex snap-x snap-mandatory overflow-x-auto scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none]"
        >
          {items.map((t, i) => (
            <li
              key={t._key}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${items.length}`}
              className="w-full shrink-0 snap-center px-2"
            >
              <figure className="mx-auto max-w-3xl text-center">
                <blockquote className="text-xl leading-8 font-medium text-balance sm:text-2xl">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-8 flex items-center justify-center gap-3 text-sm">
                  {t.avatar?.url && (
                    <Image
                      src={`${t.avatar.url}?w=96&h=96&fit=crop&auto=format`}
                      alt={t.avatar.alt ?? ''}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <span>
                    <span className="font-semibold">{t.name}</span>
                    {(t.role || t.company) && (
                      <span className="text-ink-soft">
                        {' '}
                        · {[t.role, t.company].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {items.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label={dict.testimonials.previous}
              className="rounded-full p-2 ring-1 ring-line hover:bg-surface-muted"
            >
              ←
            </button>
            <div className="flex gap-2">
              {items.map((t, i) => (
                <button
                  key={t._key}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${dict.testimonials.goTo} ${i + 1}`}
                  aria-current={i === active}
                  className={`h-2.5 w-2.5 rounded-full ${i === active ? 'bg-brand-600' : 'bg-line'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label={dict.testimonials.next}
              className="rounded-full p-2 ring-1 ring-line hover:bg-surface-muted"
            >
              →
            </button>
          </div>
        )}
      </Container>
    </section>
  )
}
