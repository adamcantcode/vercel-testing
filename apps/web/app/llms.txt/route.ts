import type { LLMS_INDEX_QUERY_RESULT, SETTINGS_QUERY_RESULT } from 'sanity-types'
import { defaultLocale } from '@/lib/i18n/config'
import { pagePath } from '@/lib/links'
import { sanityFetch } from '@/lib/sanity/fetch'
import { LLMS_INDEX_QUERY, SETTINGS_QUERY } from '@/lib/sanity/queries'
import { absoluteUrl } from '@/lib/seo/hreflang'

/**
 * /llms.txt: a plain-Markdown index of the site for LLMs and AI agents
 * (proposed standard, llmstxt.org). It gives answer engines a clean summary
 * of what exists without parsing layout HTML. Generated from Sanity, so it
 * stays current and is revalidated by the same webhook as the pages.
 */
export async function GET() {
  const [pages, settings] = await Promise.all([
    sanityFetch<LLMS_INDEX_QUERY_RESULT>({
      query: LLMS_INDEX_QUERY,
      params: { language: defaultLocale },
      tags: ['page'],
    }),
    sanityFetch<SETTINGS_QUERY_RESULT>({
      query: SETTINGS_QUERY,
      params: { id: `siteSettings-${defaultLocale}` },
      tags: ['siteSettings'],
    }),
  ])

  const lines = [
    `# ${settings?.siteName ?? 'Acme'}`,
    '',
    `> ${settings?.defaultSeo?.description ?? settings?.tagline ?? ''}`,
    '',
    '## Pages',
    '',
    ...pages.map(
      (p) =>
        `- [${p.title}](${absoluteUrl(pagePath(p.language ?? defaultLocale, p.slug))})${p.description ? `: ${p.description.replace(/\s+/g, ' ').trim()}` : ''}`,
    ),
    '',
    '## Other languages',
    '',
    `- [Español](${absoluteUrl('/es')})`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

// Cached like a page; the `page` / `siteSettings` tags revalidate it.
export const dynamic = 'force-static'
