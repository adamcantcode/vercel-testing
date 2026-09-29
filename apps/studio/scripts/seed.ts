/**
 * Seed the dataset with placeholder "Acme" content.
 *
 *   pnpm seed          (runs `sanity exec scripts/seed.ts --with-user-token`)
 *
 * Uses YOUR `sanity login` session, so no write token is created or stored.
 * Idempotent: deterministic IDs + createOrReplace, so re-running resets the
 * sample docs to this state (and leaves any other docs alone).
 */
import type { SanityDocumentStub } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import { singletonId } from '../lib/config'

const client = getCliClient({ apiVersion: '2025-01-01' })

let n = 0
const key = () => `k${(n++).toString(36).padStart(4, '0')}`

// ── Helpers that build valid Sanity shapes ──────────────────────────────────
const text = (...paragraphs: string[]) =>
  paragraphs.map((p) => ({
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text: p, marks: [] }],
  }))

const internal = (id: string, anchor?: string) => ({
  _type: 'link',
  type: 'internal',
  internal: { _type: 'reference', _ref: id },
  ...(anchor ? { anchor } : {}),
})
const external = (url: string) => ({ _type: 'link', type: 'external', external: url })
const cta = (label: string, link: object, variant: 'primary' | 'secondary' = 'primary') => ({
  _type: 'cta',
  _key: key(),
  label,
  link,
  variant,
})
const navLink = (label: string, link: object) => ({ _type: 'navLink', _key: key(), label, link })

const page = (
  id: string,
  language: 'en' | 'es',
  title: string,
  slug: string,
  blocks: object[],
  seo?: object,
) => ({
  _id: id,
  _type: 'page',
  language,
  title,
  slug: { _type: 'slug', current: slug },
  blocks: blocks.map((b) => ({ _key: key(), ...b })),
  ...(seo ? { seo: { _type: 'seo', ...seo } } : {}),
})

// ── Pages ───────────────────────────────────────────────────────────────────
const ids = {
  homeEn: 'page-home-en',
  homeEs: 'page-home-es',
  pricing: 'page-pricing-en',
  features: 'page-features-en',
  contact: 'page-contact-en',
}

const faqEn = {
  _type: 'faq',
  heading: 'Frequently asked questions',
  items: [
    [
      'What is Acme?',
      'Acme is a placeholder product used to demonstrate a Next.js + Sanity marketing site. It does nothing, beautifully.',
    ],
    [
      'Is there a free trial?',
      'Yes. Every Acme plan includes a 14-day free trial with no credit card required.',
    ],
    [
      'Can I change plans later?',
      'Yes. You can upgrade or downgrade at any time, and changes are prorated to the day.',
    ],
  ].map(([question, answer]) => ({ _key: key(), question, answer: text(answer) })),
}

const homeEn = page(
  ids.homeEn,
  'en',
  'Home',
  'home',
  [
    {
      _type: 'hero',
      eyebrow: 'Placeholder SaaS',
      heading: 'The placeholder platform for teams that ship',
      headingVariantB: 'Ship your marketing site twice as fast',
      body: text(
        'Acme is sample content for a Next.js + Sanity + Vercel reference build. Everything on this page is editable in Sanity Studio.',
      ),
      ctas: [
        cta('See pricing', internal(ids.pricing)),
        cta('Talk to sales', internal(ids.contact), 'secondary'),
      ],
    },
    {
      _type: 'featureGrid',
      heading: 'Everything a marketing team needs',
      intro:
        'Six placeholder features, rendered by a design-system component and configured in the CMS.',
      columns: 3,
      features: [
        ['bolt', 'Fast by default', 'Static pages served from the edge, regenerated on publish.'],
        ['shield', 'Secure', 'Baseline security headers and no secrets in the browser.'],
        ['chart', 'Measurable', 'A typed analytics event contract pushed to the GTM dataLayer.'],
        ['globe', 'Multilingual', 'Locale-prefixed URLs with correct hreflang and fallbacks.'],
        ['sparkles', 'Experiment-ready', 'Server-side A/B tests with zero flicker.'],
        ['users', 'Editor-friendly', 'A drag-and-drop page builder with guard-rails.'],
      ].map(([icon, title, body]) => ({ _key: key(), icon, title, body: text(body) })),
    },
    {
      _type: 'testimonialCarousel',
      heading: 'Loved by imaginary customers',
      testimonials: [
        [
          'Acme cut our launch time from weeks to days. Also, it is not real.',
          'Jordan Rivera',
          'VP Marketing',
          'Globex',
        ],
        [
          'The page builder means I never wait on engineering for a landing page.',
          'Sam Chen',
          'Growth Lead',
          'Initech',
        ],
        ['Our Core Web Vitals have never been greener.', 'Alex Morgan', 'Web Engineer', 'Umbrella'],
      ].map(([quote, name, role, company]) => ({ _key: key(), quote, name, role, company })),
    },
    {
      _type: 'ctaBanner',
      heading: 'Ready to see it in action?',
      body: 'Book a 20-minute demo with our (placeholder) team.',
      tone: 'brand',
      ctas: [cta('Book a demo', internal(ids.contact))],
    },
    faqEn,
  ],
  {
    description:
      'Acme is a placeholder SaaS product demonstrating a Next.js, Sanity, and Vercel marketing site.',
  },
)

const homeEs = page(
  ids.homeEs,
  'es',
  'Inicio',
  'home',
  [
    {
      _type: 'hero',
      eyebrow: 'SaaS de ejemplo',
      heading: 'La plataforma de ejemplo para equipos que entregan',
      body: text(
        'Acme es contenido de ejemplo para un sitio de referencia con Next.js, Sanity y Vercel. Todo en esta página se edita en Sanity Studio.',
      ),
      ctas: [
        cta('Ver precios', internal(ids.pricing)),
        cta('Hablar con ventas', internal(ids.contact), 'secondary'),
      ],
    },
    {
      _type: 'featureGrid',
      heading: 'Todo lo que necesita un equipo de marketing',
      columns: 3,
      features: [
        ['bolt', 'Rápido por defecto', 'Páginas estáticas servidas desde el edge.'],
        ['globe', 'Multilingüe', 'URLs con prefijo de idioma y hreflang correcto.'],
        ['sparkles', 'Listo para experimentos', 'Pruebas A/B del lado del servidor sin parpadeo.'],
      ].map(([icon, title, body]) => ({ _key: key(), icon, title, body: text(body) })),
    },
    {
      _type: 'faq',
      heading: 'Preguntas frecuentes',
      items: [
        [
          '¿Qué es Acme?',
          'Acme es un producto de ejemplo para demostrar un sitio de marketing con Next.js y Sanity.',
        ],
        [
          '¿Hay una prueba gratuita?',
          'Sí. Todos los planes incluyen una prueba gratuita de 14 días sin tarjeta de crédito.',
        ],
      ].map(([question, answer]) => ({ _key: key(), question, answer: text(answer) })),
    },
  ],
  {
    description:
      'Acme es un producto SaaS de ejemplo que demuestra un sitio de marketing con Next.js, Sanity y Vercel.',
  },
)

const pricing = page(
  ids.pricing,
  'en',
  'Pricing',
  'pricing',
  [
    {
      _type: 'hero',
      eyebrow: 'Pricing',
      heading: 'Simple, placeholder pricing',
      body: text('Start free, upgrade when you are ready. Every plan includes a 14-day trial.'),
    },
    {
      _type: 'pricingTable',
      heading: 'Choose a plan',
      currency: 'USD',
      tiers: [
        {
          name: 'Starter',
          price: 0,
          interval: 'month',
          description: 'For side projects',
          features: ['1 site', 'Community support'],
          cta: cta('Start free', internal(ids.contact), 'secondary'),
        },
        {
          name: 'Pro',
          price: 49,
          interval: 'month',
          description: 'For growing teams',
          features: ['10 sites', 'A/B testing', 'Email support'],
          cta: cta('Start trial', internal(ids.contact)),
          highlighted: true,
        },
        {
          name: 'Enterprise',
          interval: 'year',
          description: 'For large organisations',
          features: ['Unlimited sites', 'SSO', 'Dedicated support'],
          cta: cta('Contact sales', internal(ids.contact), 'secondary'),
        },
      ].map((t) => ({ _key: key(), _type: 'tier', ...t })),
    },
    faqEn,
    {
      _type: 'ctaBanner',
      heading: 'Not sure which plan fits?',
      tone: 'dark',
      ctas: [cta('Talk to sales', internal(ids.contact))],
    },
  ],
  {
    description:
      'Acme pricing: Starter (free), Pro ($49/month), and Enterprise plans. 14-day free trial on every plan.',
  },
)

const features = page(ids.features, 'en', 'Features', 'features', [
  {
    _type: 'hero',
    eyebrow: 'Features',
    heading: 'Built for marketing velocity',
    body: text('A tour of what this reference build demonstrates.'),
    ctas: [
      cta('View source', external('https://github.com/adamcantcode/vercel-testing'), 'secondary'),
    ],
  },
  {
    _type: 'featureGrid',
    heading: 'Under the hood',
    columns: 2,
    features: [
      [
        'globe',
        'Internationalization',
        'Document-level translations in Sanity, locale routing in the Next.js proxy.',
      ],
      [
        'chart',
        'Marketing ops',
        'GTM with Consent Mode v2, typed events, HubSpot-style lead capture.',
      ],
      ['sparkles', 'Experimentation', 'Vercel Flags SDK with precomputed static variants.'],
      ['bolt', 'On-demand ISR', 'Sanity webhooks revalidate exactly the content that changed.'],
    ].map(([icon, title, body]) => ({ _key: key(), icon, title, body: text(body) })),
  },
])

const contact = page(ids.contact, 'en', 'Contact sales', 'contact', [
  {
    _type: 'leadForm',
    anchorId: { _type: 'slug', current: 'demo' },
    heading: 'Talk to our (placeholder) sales team',
    intro:
      'Tell us a little about your team and we will be in touch within one business day. Submissions go nowhere: this is a demo.',
    submitLabel: 'Request a demo',
    successMessage: "Thanks! We'll be in touch within one business day.",
  },
])

// Links the English and Spanish homepages as translations of each other.
// (The i18n plugin creates these automatically when editors translate in Studio.)
const homeTranslations = {
  _id: 'translation-metadata-home',
  _type: 'translation.metadata',
  schemaTypes: ['page'],
  translations: [
    {
      _key: 'en',
      _type: 'internationalizedArrayReferenceValue',
      language: 'en',
      value: { _type: 'reference', _ref: ids.homeEn },
    },
    {
      _key: 'es',
      _type: 'internationalizedArrayReferenceValue',
      language: 'es',
      value: { _type: 'reference', _ref: ids.homeEs },
    },
  ],
}

// ── Global singletons ──────────────────────────────────────────────────────
const settings = (language: 'en' | 'es', tagline: string, description: string) => ({
  _id: singletonId('siteSettings', language),
  _type: 'siteSettings',
  language,
  siteName: 'Acme',
  tagline,
  defaultSeo: { _type: 'seo', description },
  organization: {
    legalName: 'Acme Placeholder, Inc.',
    contactEmail: 'hello@example.com',
    sameAs: ['https://github.com/adamcantcode/vercel-testing'],
  },
})

const navigation = (
  language: 'en' | 'es',
  labels: {
    features: string
    pricing: string
    contact: string
    demo: string
    product: string
    company: string
  },
  homeId: string,
) => ({
  _id: singletonId('navigation', language),
  _type: 'navigation',
  language,
  header: [
    navLink(labels.features, internal(ids.features)),
    navLink(labels.pricing, internal(ids.pricing)),
    navLink(labels.contact, internal(ids.contact)),
  ],
  headerCta: cta(labels.demo, internal(ids.contact, 'demo')),
  footerColumns: [
    {
      _key: key(),
      title: labels.product,
      links: [
        navLink(labels.features, internal(ids.features)),
        navLink(labels.pricing, internal(ids.pricing)),
      ],
    },
    {
      _key: key(),
      title: labels.company,
      links: [
        navLink('Home', internal(homeId)),
        navLink('GitHub', external('https://github.com/adamcantcode/vercel-testing')),
      ],
    },
  ],
})

async function main() {
  const docs: (SanityDocumentStub & { _id: string })[] = [
    homeEn,
    homeEs,
    pricing,
    features,
    contact,
    homeTranslations,
    settings(
      'en',
      'The placeholder platform for teams that ship',
      'Acme is a placeholder SaaS product demonstrating a Next.js, Sanity, and Vercel marketing site.',
    ),
    settings(
      'es',
      'La plataforma de ejemplo para equipos que entregan',
      'Acme es un producto SaaS de ejemplo que demuestra un sitio de marketing con Next.js, Sanity y Vercel.',
    ),
    navigation(
      'en',
      {
        features: 'Features',
        pricing: 'Pricing',
        contact: 'Contact',
        demo: 'Book a demo',
        product: 'Product',
        company: 'Company',
      },
      ids.homeEn,
    ),
    navigation(
      'es',
      {
        features: 'Funciones',
        pricing: 'Precios',
        contact: 'Contacto',
        demo: 'Reservar demo',
        product: 'Producto',
        company: 'Empresa',
      },
      ids.homeEs,
    ),
  ]

  const tx = client.transaction()
  for (const doc of docs) tx.createOrReplace(doc)
  const result = await tx.commit()
  console.log(`Seeded ${docs.length} documents (transaction ${result.transactionId})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
