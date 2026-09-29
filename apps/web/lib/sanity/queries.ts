import { defineQuery } from 'next-sanity'

/*
 * All GROQ lives here. `pnpm typegen` scans this file and generates a
 * `<NAME>_RESULT` type for each query into packages/sanity-types, so
 * components get exact types for exactly the fields they asked for.
 *
 * Projections are explicit (no bare `...` on blocks): the page only receives
 * fields a component renders, and TypeGen can type every one of them.
 */

// Reusable projections. GROQ has no functions, so we compose strings.
const LINK = /* groq */ `{
  type,
  external,
  anchor,
  "internal": internal->{ "slug": slug.current, language }
}`

const CTA = /* groq */ `{ _key, label, variant, link ${LINK} }`

const RICH_TEXT = /* groq */ `[]{
  ...,
  markDefs[]{ ..., _type == "link" => ${LINK} }
}`

const IMAGE = /* groq */ `{
  alt,
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`

const BLOCKS = /* groq */ `blocks[]{
  _key,
  _type,
  _type == "hero" => {
    eyebrow, heading, headingVariantB,
    body${RICH_TEXT},
    image${IMAGE},
    ctas[]${CTA}
  },
  _type == "featureGrid" => {
    "anchorId": anchorId.current, heading, intro, columns,
    features[]{ _key, icon, title, body${RICH_TEXT} }
  },
  _type == "pricingTable" => {
    heading, intro, currency,
    tiers[]{ _key, name, price, interval, description, features, highlighted, cta${CTA} }
  },
  _type == "testimonialCarousel" => {
    heading,
    testimonials[]{ _key, quote, name, role, company, avatar${IMAGE} }
  },
  _type == "ctaBanner" => { heading, body, tone, ctas[]${CTA} },
  _type == "faq" => { heading, items[]{ _key, question, answer${RICH_TEXT} } },
  _type == "leadForm" => {
    "anchorId": anchorId.current, heading, intro, hubspotFormId, submitLabel, successMessage
  }
}`

/**
 * Translations of a page, via the metadata document that
 * @sanity/document-internationalization maintains. Used for hreflang and the
 * language switcher. Only published translations with a slug are returned.
 */
const TRANSLATIONS = /* groq */ `"translations": *[_type == "translation.metadata" && references(^._id)][0]
  .translations[defined(value->slug.current)]{
    "language": value->language,
    "slug": value->slug.current
  }`

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug && language == $language][0]{
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    language,
    seo{ title, description, noIndex, "ogImage": ogImage.asset->url },
    ${TRANSLATIONS},
    ${BLOCKS}
  }
`)

/** Every published page × language, for generateStaticParams and the sitemap. */
export const PAGE_PATHS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current) && defined(language)]{
    "slug": slug.current,
    language,
    _updatedAt,
    "noIndex": seo.noIndex,
    ${TRANSLATIONS}
  }
`)

/** Compact index for /llms.txt (answer-engine discovery). */
export const LLMS_INDEX_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current) && language == $language && seo.noIndex != true]
    | order(slug.current asc){
      title,
      "slug": slug.current,
      language,
      "description": coalesce(seo.description, pt::text(blocks[_type == "hero"][0].body))
    }
`)

export const SETTINGS_QUERY = defineQuery(`
  *[_id == $id][0]{
    siteName,
    tagline,
    gtmContainerId,
    defaultSeo{ title, description, "ogImage": ogImage.asset->url },
    organization{ legalName, contactEmail, sameAs, "logo": logo.asset->url }
  }
`)

export const NAVIGATION_QUERY = defineQuery(`
  *[_id == $id][0]{
    header[]{ _key, label, link ${LINK} },
    headerCta${CTA},
    footerColumns[]{ _key, title, links[]{ _key, label, link ${LINK} } },
    legal
  }
`)
