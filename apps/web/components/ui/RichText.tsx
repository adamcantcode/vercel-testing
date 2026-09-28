import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { isExternalHref, resolveHref, type SanityLink } from '@/lib/links'
import type { RichTextValue } from '@/lib/sanity/types'

/**
 * Portable Text renderer. Every node type the schema allows (see
 * apps/studio/schemas/objects/richText.ts) has an explicit component here,
 * so editors can't produce markup the design system hasn't styled.
 */
function components(locale: Locale): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>,
      h3: ({ children }) => <h3 className="mt-6 text-lg font-semibold">{children}</h3>,
    },
    list: {
      bullet: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5">{children}</ul>,
      number: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5">{children}</ol>,
    },
    marks: {
      link: ({ value, children }) => {
        const href = resolveHref(value as SanityLink, locale)
        if (!href) return <>{children}</>
        return isExternalHref(href) ? (
          <a
            href={href}
            className="underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ) : (
          <Link href={href} className="underline underline-offset-2">
            {children}
          </Link>
        )
      },
    },
  }
}

export function RichText({
  value,
  locale,
  className = '',
}: {
  value: RichTextValue | null | undefined
  locale: Locale
  className?: string
}) {
  if (!value?.length) return null
  return (
    <div className={className}>
      <PortableText value={value} components={components(locale)} />
    </div>
  )
}
