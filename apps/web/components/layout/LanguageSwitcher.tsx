'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { localeMeta, locales, type Locale } from '@/lib/i18n/config'

/**
 * Lives in the (code-owned) header, which doesn't know which CMS page is
 * rendering. Rather than duplicate the translation lookup, it reads the
 * page's own <link rel="alternate" hreflang> tags, so the switcher and
 * hreflang can never disagree. Before hydration (or if a translation doesn't
 * exist) it links to that locale's homepage.
 */
export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname()
  const [hrefs, setHrefs] = useState<Partial<Record<Locale, string>>>({})

  useEffect(() => {
    const found: Partial<Record<Locale, string>> = {}
    document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((el) => {
      const lang = locales.find((l) => localeMeta[l].hreflang === el.hreflang)
      if (lang) found[lang] = new URL(el.href).pathname
    })
    // Syncing from the DOM (external to React) is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHrefs(found)
  }, [pathname])

  return (
    <nav aria-label={label}>
      <ul className="flex gap-1 text-sm">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={hrefs[locale] ?? `/${locale}`}
              hrefLang={localeMeta[locale].hreflang}
              lang={locale}
              aria-current={locale === current ? 'true' : undefined}
              // Remember an explicit choice so the proxy honours it next visit.
              onClick={() =>
                (document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`)
              }
              className={`rounded px-2 py-1 uppercase ${locale === current ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
            >
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
