import { ImageResponse } from 'next/og'

/**
 * Auto-generated 1200×630 social image, used when a page has no ogImage in
 * Sanity. /api/og?title=Pricing&site=Acme
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') || 'Acme').slice(0, 100)
  const site = (searchParams.get('site') || 'Acme').slice(0, 40)

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: 'linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)',
        color: 'white',
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 700, opacity: 0.9 }}>{site}</div>
      <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>
        {title}
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
