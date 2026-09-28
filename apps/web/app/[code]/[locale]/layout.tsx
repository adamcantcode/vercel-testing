import { GoogleTagManager } from '@next/third-parties/google'
import { Geist } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SkipLink } from '@/components/layout/SkipLink'
import { ClickTracker } from '@/lib/analytics/ClickTracker'
import { ConsentDefaults } from '@/lib/analytics/ConsentDefaults'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getNavigation, getSettings } from '@/lib/sanity/loaders'
import { JsonLd, organizationLd, websiteLd } from '@/lib/seo/jsonld'
import { siteUrl } from '@/lib/site'
import '../../globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' })

/**
 * Root layout per locale. Owns everything that's the same on every page:
 * <html lang>, consent + GTM, header/footer chrome, and site-wide JSON-LD.
 *
 * (The [code] segment is the precomputed experiment code; see proxy.ts.
 * Visitors never see it in the URL.)
 */
export async function generateMetadata({ params }: LayoutProps<'/[code]/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const settings = await getSettings(locale)
  const siteName = settings?.siteName ?? 'Acme'
  return {
    metadataBase: new URL(siteUrl),
    title: { default: siteName, template: `%s | ${siteName}` },
    description: settings?.defaultSeo?.description ?? undefined,
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[code]/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [settings, nav] = await Promise.all([getSettings(locale), getNavigation(locale)])
  const dict = getDictionary(locale)
  const siteName = settings?.siteName ?? 'Acme'
  const gtmId = settings?.gtmContainerId || process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html lang={locale} className={geist.variable}>
      <head>
        {/* Must precede GTM so tags start in a consent-denied state. */}
        <ConsentDefaults />
      </head>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body className="flex min-h-screen flex-col">
        <SkipLink label={dict.skipToContent} />
        <Header nav={nav} siteName={siteName} locale={locale} dict={dict} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer nav={nav} siteName={siteName} locale={locale} dict={dict} />
        <ClickTracker />
        <JsonLd data={organizationLd(settings)} />
        <JsonLd data={websiteLd(settings, locale)} />
      </body>
    </html>
  )
}
