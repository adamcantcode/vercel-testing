import { evaluate, serialize } from 'flags/next'
import { NextResponse, type NextRequest } from 'next/server'
import { VISITOR_COOKIE } from '@/lib/experiments/bucket'
import { precomputeFlags } from '@/lib/experiments/flags'
import { isLocale, LOCALE_COOKIE, matchLocale } from '@/lib/i18n/config'

/**
 * Runs before every page request (Next 16 renamed middleware.ts → proxy.ts).
 * Two jobs, both needed before the CDN can pick a cached page:
 *
 * 1. LOCALE ROUTING: URLs without a locale prefix get a 307 to one, chosen
 *    by: explicit choice cookie → Accept-Language → default. 307 (not 308)
 *    because the answer depends on the visitor and must not be cached.
 *
 * 2. EXPERIMENT PRECOMPUTE: evaluate the flags for this visitor, encode the
 *    results into a short signed code, and REWRITE (invisible to the visitor)
 *    /en/pricing → /<code>/en/pricing. Each code is its own static page, so
 *    every variant is CDN-cached HTML: no flicker, no client-side testing JS.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const firstSegment = pathname.split('/')[1]

  // ── 1. Locale ────────────────────────────────────────────────────────────
  if (!isLocale(firstSegment)) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
    const locale = isLocale(cookieLocale)
      ? cookieLocale
      : matchLocale(request.headers.get('accept-language'))
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    url.search = search
    return NextResponse.redirect(url, 307)
  }

  // ── 2. Visitor identity for bucketing ────────────────────────────────────
  // First visit: mint an ID and inject it into THIS request's cookies too,
  // so flags see it immediately (not only from the second request on).
  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value
  const isNewVisitor = !visitorId
  const headers = new Headers(request.headers)
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    headers.set(
      'cookie',
      [request.headers.get('cookie'), `${VISITOR_COOKIE}=${visitorId}`].filter(Boolean).join('; '),
    )
  }

  // ── 3. Precompute flags → rewrite to the variant's static page ───────────
  // evaluate() also honours Vercel Toolbar overrides (vercel-flag-overrides
  // cookie), which is how QA forces a variant on a preview deployment.
  const values = await evaluate([...precomputeFlags], new Request(request.url, { headers }))
  const code = await serialize([...precomputeFlags], values)

  const url = request.nextUrl.clone()
  url.pathname = `/${code}${pathname}`
  const response = NextResponse.rewrite(url, { request: { headers } })

  if (isNewVisitor) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // Readable by JS on purpose: ClientExperiment buckets in the browser.
      // It's a random ID with no PII.
      httpOnly: false,
    })
  }
  return response
}

export const config = {
  // Skip API routes, Next internals, Vercel internals, well-known endpoints,
  // and anything with a file extension (robots.txt, sitemap.xml, llms.txt, images).
  matcher: ['/((?!api|_next|_vercel|\\.well-known|.*\\..*).*)'],
}
