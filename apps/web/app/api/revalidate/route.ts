import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import type { CacheTag } from '@/lib/sanity/fetch'

/**
 * On-demand revalidation, called by a Sanity GROQ-powered webhook on every
 * publish/unpublish/delete. The flow:
 *
 *   Editor publishes → Sanity POSTs { _type, slug, language } here
 *   → we verify the HMAC signature → revalidateTag(_type)
 *   → the next visitor to any page that read that type gets fresh HTML.
 *
 * No rebuild, no redeploy. See README "Content → Vercel" for webhook setup.
 */
type WebhookPayload = { _type?: string; slug?: string; language?: string }

const TAGS: Record<string, CacheTag> = {
  page: 'page',
  siteSettings: 'siteSettings',
  navigation: 'navigation',
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json(
      { message: 'SANITY_REVALIDATE_SECRET is not configured' },
      { status: 500 },
    )
  }

  try {
    // Verifies the `sanity-webhook-signature` header. The `true` waits briefly
    // so the Content Lake's eventual consistency can't hand us the old doc.
    const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret, true)

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
    }
    const tag = body?._type ? TAGS[body._type] : undefined
    if (!tag) {
      return NextResponse.json(
        { message: `Ignored type: ${body?._type ?? 'none'}` },
        { status: 400 },
      )
    }

    // { expire: 0 }: the next request blocks for fresh data rather than being
    // served stale once. Right for "I just hit publish, show me".
    revalidateTag(tag, { expire: 0 })
    return NextResponse.json({
      revalidated: true,
      tag,
      slug: body?.slug,
      language: body?.language,
      now: Date.now(),
    })
  } catch (err) {
    console.error('[revalidate]', err)
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
