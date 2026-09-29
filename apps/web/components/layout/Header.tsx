import Link from 'next/link'
import type { NAVIGATION_QUERY_RESULT } from 'sanity-types'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { resolveHref } from '@/lib/links'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileMenu } from './MobileMenu'

/**
 * HARD-CODED layout, CMS-fed links. Marketing controls which links appear
 * (Navigation document in Sanity); this file controls structure, order of
 * regions, breakpoints, and accessibility. Changing it requires a PR.
 */
export function Header({
  nav,
  siteName,
  locale,
  dict,
}: {
  nav: NAVIGATION_QUERY_RESULT
  siteName: string
  locale: Locale
  dict: Dictionary
}) {
  const links = (nav?.header ?? [])
    .map((item) => ({ key: item._key, label: item.label, href: resolveHref(item.link, locale) }))
    .filter((l): l is { key: string; label: string; href: string } => Boolean(l.href))
  const ctaHref = resolveHref(nav?.headerCta?.link, locale)

  const linkList = (className: string) => (
    <ul className={className}>
      {links.map((l) => (
        <li key={l.key}>
          <Link href={l.href} className="text-sm font-medium text-ink-soft hover:text-ink">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between gap-6">
        <Link href={`/${locale}`} className="text-lg font-bold tracking-tight">
          {siteName}
        </Link>
        <nav aria-label={dict.mainNav} className="hidden md:block">
          {linkList('flex items-center gap-8')}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher current={locale} label={dict.languageSwitcher} />
          {nav?.headerCta && ctaHref && (
            <ButtonLink
              href={ctaHref}
              trackLocation="header"
              className="hidden !py-2 sm:inline-flex"
            >
              {nav.headerCta.label}
            </ButtonLink>
          )}
          <MobileMenu openLabel={dict.openMenu} closeLabel={dict.closeMenu}>
            <nav aria-label={dict.mainNav}>{linkList('flex flex-col gap-4')}</nav>
          </MobileMenu>
        </div>
      </Container>
    </header>
  )
}
