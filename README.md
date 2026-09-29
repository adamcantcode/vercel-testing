# vercel-testing: Next.js + Sanity + Vercel marketing site

A learning sandbox that mirrors an enterprise SaaS marketing setup: a CMS-driven page builder, localized routing, SEO/AEO, marketing-ops instrumentation, server-side A/B testing, and a branch → PR → CI → preview → production workflow. Content is placeholder ("Acme").

|                    |                                                                                |
| ------------------ | ------------------------------------------------------------------------------ |
| **Web**            | Next.js 16 (App Router, TypeScript, Tailwind 4) in `apps/web` → Vercel         |
| **CMS**            | Sanity Studio 6 in `apps/studio` → `https://acme-vercel-testing.sanity.studio` |
| **Types**          | Sanity TypeGen output in `packages/sanity-types`, shared by both               |
| **Monorepo**       | pnpm workspaces + Turborepo                                                    |
| **Sanity project** | `orm5eox2`, dataset `production` (public read)                                 |

```
                ┌───────────── Sanity Content Lake ─────────────┐
 Editors ──▶ Studio (apps/studio) ── publish ──▶  documents     │
                └──────────────┬────────────────────┬───────────┘
                     GROQ fetch│                    │ GROQ webhook (signed)
                               ▼                    ▼
 Visitor ──▶ Vercel CDN ──▶ proxy.ts ──▶ Next.js pages ◀── /api/revalidate
             (static HTML   locale +      (ISR, cached     revalidateTag()
              per variant)  A/B bucket     by tag)
```

---

## 1. Local development

**Prereqs:** Node 22.19+ (`.nvmrc` pins 22.23.2), pnpm 10, access to the Sanity project.

```bash
nvm use
pnpm install
```

Create **`apps/web/.env.local`** (git-ignored; never commit it). The only required value is `FLAGS_SECRET`:

```bash
echo "FLAGS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")" >> apps/web/.env.local
```

Then run both apps together:

```bash
pnpm dev
```

- Website: <http://localhost:3000> (redirects to `/en` or `/es` based on your browser language)
- Studio: <http://localhost:3333> (log in with the same account as `sanity login`)

Edit a page in Studio → publish → reload the site. In `next dev` every request refetches, so changes show immediately. In production, changes show when the webhook fires (section 2).

**First-time content:** `pnpm seed` loads the sample pages, settings, and navigation using your `sanity login` session (no token needed). It's idempotent: re-running resets the sample docs.

### Scripts (repo root)

| Command                       | What it does                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `pnpm dev`                    | Web (:3000) + Studio (:3333) in parallel                                         |
| `pnpm verify`                 | Lint + typecheck + build both apps (what CI runs)                                |
| `pnpm typegen`                | Extract Studio schema → generate query/result types into `packages/sanity-types` |
| `pnpm seed`                   | Load placeholder content into the dataset                                        |
| `pnpm --filter studio deploy` | Deploy Studio to `*.sanity.studio` (CI does this on merge)                       |

### Environment variables

Configured in `apps/web/.env.local` locally and in **Vercel → Settings → Environment Variables** for deployments. Non-secret Sanity IDs are committed in `apps/web/lib/sanity/config.ts` / `apps/studio/lib/config.ts`, so you don't need to set them.

| Variable                                                      | Required | Secret | Purpose                                                                                               |
| ------------------------------------------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `FLAGS_SECRET`                                                | **yes**  | yes    | Signs experiment codes and gates the Flags Explorer. Use a different value per Vercel environment.    |
| `SANITY_REVALIDATE_SECRET`                                    | prod     | yes    | Shared secret that verifies the Sanity webhook signature.                                             |
| `NEXT_PUBLIC_GTM_ID`                                          | no       | no     | GTM container (e.g. `GTM-XXXXXXX`). Unset = events log to the console. Site Settings can override it. |
| `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`                        | no       | no     | Lead form destination. Unset = redacted dry-run log.                                                  |
| `SITE_URL`                                                    | no       | no     | Canonical origin override. Defaults to the Vercel production domain.                                  |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | no       | no     | Point the site at another project/dataset (e.g. staging).                                             |

---

## 2. How content flows from Sanity to Vercel

Pages are **statically generated and cached** at the edge. Nothing talks to Sanity on a normal page view.

1. **Build:** `generateStaticParams` asks Sanity for every published page × locale × experiment variant, and pre-renders each one.
2. **Cache tags:** every GROQ fetch goes through `sanityFetch()` (`apps/web/lib/sanity/fetch.ts`), which tags the response with its document type (`page`, `siteSettings`, `navigation`) and sets a 1-hour backstop revalidation.
3. **Publish:** an editor publishes. Sanity's **GROQ-powered webhook** POSTs `{ _type, slug, language }` to `/api/revalidate`.
4. **Verify + invalidate:** the route checks the HMAC signature with `SANITY_REVALIDATE_SECRET` (`parseBody` from `next-sanity/webhook`), then calls `revalidateTag(_type, { expire: 0 })`.
5. **Regenerate:** the next visitor to any page that used that type gets freshly rendered HTML, which is cached again. **No rebuild, no redeploy.**

Why type-level tags? A page's HTML depends on _other_ documents too: internal link slugs, the language switcher, the sitemap. Invalidating "all pages" on any page publish is the simplest correct strategy for a site with hundreds of pages. Move to per-document tags only if regeneration cost becomes a measurable problem.

### Webhook setup (once, after the first production deploy)

sanity.io/manage → project `orm5eox2` → **API → Webhooks → Create webhook**:

| Field       | Value                                             |
| ----------- | ------------------------------------------------- |
| URL         | `https://<your-production-domain>/api/revalidate` |
| Dataset     | `production`                                      |
| Trigger on  | Create, Update, Delete                            |
| Filter      | `_type in ["page", "siteSettings", "navigation"]` |
| Projection  | `{ _type, "slug": slug.current, language }`       |
| HTTP method | POST                                              |
| Secret      | same value as Vercel's `SANITY_REVALIDATE_SECRET` |
| API version | `v2025-01-01`                                     |

Test it: change a heading in Studio, publish, and reload production within a few seconds. **Deployments** in the Vercel dashboard should show no new build.

---

## 3. CMS vs code: who owns what

| Owned by **code** (PR + review)                                                         | Owned by **Sanity** (publish, no deploy)               |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Page chrome: `components/layout/*` (header/footer layout, skip link, language switcher) | Which links appear in header/footer (`navigation` doc) |
| What each block looks like: `components/blocks/*`                                       | Which blocks a page has, their order, and their copy   |
| The block palette (`blockRegistry` + Studio `blocks` array)                             | Creating/translating pages, slugs, SEO overrides       |
| Form fields and validation (`lib/forms/leadSchema.ts`)                                  | Form heading, copy, and which HubSpot form receives it |
| Experiment **bucketing** (`lib/experiments/flags.ts`)                                   | Experiment **copy** (hero "Heading, variant B")        |
| Analytics event contract (`lib/analytics/events.ts`)                                    | GTM container override (Site Settings)                 |

The page builder is the `blocks` array on `page`. Editors drag, drop, and configure blocks from a fixed palette with validation (length limits, required alt text, closed lists for icons, button styles, and columns), so any combination stays on-brand.

**Adding a block:** add a schema in `apps/studio/schemas/objects/blocks/`, register it in that folder's `index.ts`, add a projection in `PAGE_QUERY`, run `pnpm typegen`, then add a component to `blockRegistry`. TypeScript fails the build until the component exists.

### Content model

```
page (document, one per language)
├─ title, slug ("home" = locale root), language, seo{}
└─ blocks[]                       ← page builder
   ├─ hero            eyebrow, heading, headingVariantB, body[richText], image{alt}, ctas[cta]
   ├─ featureGrid     heading, intro, columns, features[]{ icon, title, body[richText] }
   ├─ pricingTable    heading, currency, tiers[]{ name, price, interval, features[], cta, highlighted }
   ├─ testimonialCarousel  testimonials[]{ quote, name, role, company, avatar }
   ├─ ctaBanner       heading, body, tone, ctas[cta]
   ├─ faq             items[]{ question, answer[richText] }
   └─ leadForm        heading, intro, hubspotFormId, submitLabel, successMessage

cta   = { label, variant, link }
link  = { type: internal → page reference | external → URL, anchor }
siteSettings-{en,es}, navigation-{en,es}   ← per-language singletons (fixed IDs)
translation.metadata                       ← links translations (i18n plugin)
```

---

## 4. Internationalization

- **URLs:** every locale is prefixed, including the default (`/en/pricing`, `/es/precios`), so each language has one unambiguous URL.
- **Detection** (`apps/web/proxy.ts`): prefix-less requests get a 307 to a locale, chosen by the `NEXT_LOCALE` cookie (set when a visitor uses the switcher), then `Accept-Language`, then `en`.
- **Content:** document-level translations using `@sanity/document-internationalization`. Each translation is a separate `page` that can have different blocks per market. Use the **Translations** menu on a page in Studio to create a linked translation.
- **Fallback:** a page with no Spanish translation still resolves at `/es/...`. It shows the English content with a localized notice and `lang="en"` on the content, and canonicalizes to the English URL so it isn't indexed as a duplicate.
- **hreflang:** emitted only for translations that exist, reciprocal, plus `x-default`. It appears in both `<head>` and `sitemap.xml`. The language switcher reads these same tags, so the two can't disagree.
- **UI strings** (form labels, errors, a11y labels) live in `lib/i18n/dictionaries/*.ts`. Marketing copy lives in Sanity.

**Adding a locale:** add it to `apps/web/lib/i18n/config.ts`, add it to `apps/studio/lib/config.ts`, add a dictionary, and create its settings and navigation documents.

---

## 5. SEO and AEO (answer-engine optimization)

- `generateMetadata` for each page (`lib/seo/metadata.ts`): title template, description fallbacks, canonical, hreflang, OpenGraph/Twitter tags, and a generated OG image (`/api/og`) when the page has none.
- **JSON-LD** (`lib/seo/jsonld.tsx`, typed with `schema-dts`), always derived from the same CMS content the page shows:
  - Organization + WebSite, site-wide
  - WebPage + BreadcrumbList, per page
  - **FAQPage**, generated automatically from any FAQ block
  - **Product/Offer**, generated automatically from the pricing table
- `/robots.txt`: production allows search engines and named AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…). **Every non-production deployment returns `Disallow: /` and `noindex`**, so preview URLs never get indexed.
- `/llms.txt`: a Markdown index of the site for LLMs, generated from Sanity and revalidated by the same webhook.
- FAQ answers are in the HTML (`<details>`), not injected on click, so crawlers that don't run JavaScript still see them.

---

## 6. Marketing ops

- **GTM** loads through `@next/third-parties` when a container ID is configured. **Consent Mode v2** defaults (all denied) are set first. A consent banner is Phase 2.
- **`trackEvent()`** (`lib/analytics/trackEvent.ts`) pushes typed events to `dataLayer`. The event contract is a TypeScript union in `lib/analytics/events.ts`: `cta_click`, `generate_lead`, `form_error`, `experiment_exposure`. GTM decides where events go (GA4, pixels), so adding a vendor doesn't require a deploy.
- **CTA tracking:** add `data-track="cta"` plus `data-track-location` to any link and one delegated listener reports it. Block components stay Server Components.
- **Lead form** (`leadForm` block → `app/actions/lead.ts` Server Action):
  - A shared Zod schema validates on the client for UX and on the server as the real gate.
  - A honeypot field catches bots.
  - First-touch UTM/gclid and the HubSpot `hutk` cookie are captured.
  - It posts to the HubSpot Forms v3 API when configured and logs a **redacted** dry run otherwise. Raw PII is never logged.

---

## 7. Experimentation

**Server-side (the default):** Vercel Flags SDK with **precompute**.

1. `proxy.ts` gives each visitor a random `visitor_id` cookie.
2. It evaluates the flags in `lib/experiments/flags.ts` using deterministic hash bucketing, with no network call.
3. It serializes the results into a signed code and rewrites `/en` → `/<code>/en` invisibly.
4. Each variant is its own **static, CDN-cached page**, so there's no flicker, no layout shift, and no client-side testing script.

The demo experiment, `hero-headline`, splits visitors 50/50 between the hero's heading and the CMS field "Heading, variant B". Code owns _who_ sees a variant; marketing owns _what_ it says.

**Client-side (for contrast):** `<ClientExperiment>` on the CTA banner. The server renders control, and the variant is picked after hydration, which causes a visible swap ("flicker"). That's acceptable below the fold for same-size changes; for anything above the fold, use server-side.

**Measurement:** each rendered variant fires `experiment_exposure { experiment_id, variant_id, assignment }`. Join it to `generate_lead` on visitor to compute lift.

**QA:** on preview deployments, the Vercel Toolbar's Flags Explorer (backed by `/.well-known/vercel/flags`) lets you force a variant for yourself.

**Adding a provider later** (Statsig, LaunchDarkly, GrowthBook): replace a flag's `decide()` with the provider's Flags SDK adapter. Nothing else changes.

---

## 8. Git branching and the CI/CD code-review gate

Built for a small team shipping marketing work quickly:

- **Trunk-based.** `main` is always production. All work happens on short-lived branches (`feat/*`, `fix/*`, `content-model/*`, `chore/*`) that are squash-merged through PRs.
- **Content changes skip Git entirely.** Publishing in Sanity goes through the webhook (section 2). Only code and schema changes need a PR, and that split is what keeps marketing fast.
- **Every PR gets:**
  1. **Vercel preview deployment**: a unique URL where QA and stakeholders review. It's always `noindex`.
  2. **CI** (`.github/workflows/ci.yml`): frozen install → TypeGen drift check → lint → typecheck → build web and studio.
  3. **PR template** with a QA checklist (both locales, keyboard pass, one H1, canonical/hreflang, events, mobile).
- **On merge to `main`:**
  - Vercel deploys production.
  - If `apps/studio/**` changed, `.github/workflows/deploy-studio.yml` redeploys the Studio (needs a `SANITY_AUTH_TOKEN` repo secret).
  - `apps/web/vercel.json` runs `turbo-ignore`, so Studio-only changes don't trigger a website deploy.
- **Dependabot** opens grouped weekly PRs (Sanity, Next/React, other minor/patch), and each one runs through the same gate.

### Branch protection on `main`

| Setting                                                | Solo (current)                         | Team                                        |
| ------------------------------------------------------ | -------------------------------------- | ------------------------------------------- |
| Require a pull request before merging                  | ✅                                     | ✅                                          |
| Required approvals                                     | 0 (GitHub doesn't allow self-approval) | 1                                           |
| Require review from Code Owners (`.github/CODEOWNERS`) | –                                      | ✅ (schemas, proxy, analytics, experiments) |
| Require status check `verify` to pass                  | ✅                                     | ✅                                          |
| Require branch up to date before merging               | ✅                                     | ✅                                          |
| Block force pushes and deletion                        | ✅                                     | ✅                                          |

When working with **external agency developers**, give them write access to branches only. CODEOWNERS then routes every schema, routing, and analytics change to the site owner, while block and component work can be reviewed by any maintainer.

### Schema changes without breaking live content

Studio and web deploy independently, so schema changes are **expand → migrate → contract**:

1. **Expand:** add the new field (optional) and deploy code that reads the new _or_ old shape.
2. **Migrate:** backfill content (a `sanity exec` script or `sanity migration`).
3. **Contract:** in a later PR, make the field required and remove the old one.

Never rename or remove a field in the same PR as the code that stops reading it.

---

## 9. Phase 2 backlog

- **Draft Mode + Visual Editing:** Sanity Presentation tool, click-to-edit on a live preview.
- **Staging dataset:** a `staging` dataset for Vercel preview deploys, with a promotion workflow.
- **Automated QA:** Playwright smoke tests and Lighthouse CI budgets against each PR's preview URL.
- **CMS-managed redirects:** a `redirect` document applied in the proxy.
- **Consent banner:** wired to `gtag('consent', 'update')`.
- **Full CSP:** nonces plus a GTM allowlist.

Design spec: [`docs/superpowers/specs/2026-09-28-vercel-testing-design.md`](docs/superpowers/specs/2026-09-28-vercel-testing-design.md)
