import Link from 'next/link'
import type { NAVIGATION_QUERY_RESULT } from 'sanity-types'
import { Container } from '@/components/ui/Container'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { isExternalHref, resolveHref } from '@/lib/links'

export function Footer({
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
  return (
    <footer className="border-t border-line bg-surface-muted py-12 text-sm">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {nav?.footerColumns?.map((col) => (
            <div key={col._key}>
              <h2 className="font-semibold">{col.title}</h2>
              <ul className="mt-4 space-y-2">
                {col.links?.map((item) => {
                  const href = resolveHref(item.link, locale)
                  if (!href) return null
                  return (
                    <li key={item._key}>
                      {isExternalHref(href) ? (
                        <a
                          href={href}
                          className="text-ink-soft hover:text-ink"
                          rel="noopener noreferrer"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link href={href} className="text-ink-soft hover:text-ink">
                          {item.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-ink-soft">
          © {new Date().getFullYear()} {siteName}. {nav?.legal ?? dict.footerRights}
        </p>
      </Container>
    </footer>
  )
}
