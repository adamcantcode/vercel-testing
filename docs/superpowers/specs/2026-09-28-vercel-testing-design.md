# vercel-testing — Next.js + Sanity + Vercel marketing-site sandbox

## Context

A **personal learning sandbox** that mirrors the stack and workflow of the Staff Web Engineer posting: Next.js App Router + Sanity headless CMS + Vercel, with i18n, SEO/AEO, marketing-ops stubs, experimentation, and a real branch → PR → CI → preview → prod workflow. It is the Next.js/Sanity counterpart to the existing Astro reference site at `~/Sites/b2b-marketing-site`. Success = it runs end-to-end on real free-tier accounts and the user understands every moving part (README explains each).

### Decisions made with the user

| Topic                                                                | Decision                                                                                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose                                                              | Learning sandbox (working + understood > polished)                                                                                                                  |
| Services                                                             | Real free-tier Sanity + real Vercel                                                                                                                                 |
| Brand/content                                                        | Generic placeholder ("Acme")                                                                                                                                        |
| Layout                                                               | pnpm + Turborepo monorepo: `apps/web`, `apps/studio` (standalone Studio → `*.sanity.studio`), `packages/sanity-types`                                               |
| i18n                                                                 | `/en` + `/es` plumbing + one translated page (Spanish home); document-level translations                                                                            |
| GitHub                                                               | **Public** repo on personal account `adamcantcode`; branch protection = PR required + CI must pass + up-to-date, **0 required approvals** (team setting documented) |
| Extras (draft mode, staging dataset, Playwright/LHCI, CMS redirects) | **Deferred to Phase 2 backlog** — not in initial build                                                                                                              |

### Environment facts (verified)

- Location: `~/Sites/vercel-testing` (does not exist yet).
- Node: run every command with `source ~/.nvm/nvm.sh && nvm use >/dev/null` (`.nvmrc` → `22.23.2`; shell default 22.12 is too old). pnpm available.
- Versions (npm, today): next 16.3.6, react 19.3, tailwindcss 4.3.3, sanity 6.16, next-sanity 13.3.4, @sanity/document-internationalization 6.2, flags 4.3 (Vercel Flags SDK), @next/third-parties 16.3, zod 4.6.
- Next 16 renamed `middleware.ts` → `proxy.ts`; confirm against Next 16 docs before writing it (use whatever the installed version expects).
- Git identity: `~/Sites/*` defaults to the **work** identity. Fix **repo-locally only** (no global config changes): `git config user.name adam`, `git config user.email amacaulay.g@gmail.com`; remote = `git@github-personal:adamcantcode/vercel-testing.git` (SSH alias verified authenticating as adamcantcode). gh active account is `amacaulay-ch`; switch to `adamcantcode` only for repo creation / branch protection, then switch back.
- **No `.env` files will be read or written by Claude** (user rule). Non-secret config (Sanity projectId, dataset, locales) lives in committed `config.ts` with env overrides; secrets are listed in a README table and the user creates `apps/web/.env.local` / runs `vercel env add` themselves.

## Architecture

```
vercel-testing/                   pnpm workspaces + turbo.json, .nvmrc, .github/
├─ apps/web/                      Next.js 16 (Vercel project, root dir = apps/web)
│  ├─ app/[locale]/layout.tsx     <html lang>, Header/Footer, GTM, site JSON-LD
│  ├─ app/[code]/[locale]/[[...slug]]/page.tsx   page renderer (code = Flags SDK precompute)
│  ├─ app/api/revalidate/route.ts Sanity webhook → verify signature → revalidateTag
│  ├─ app/actions/lead.ts         Server Action: HubSpot-style lead submit
│  ├─ app/robots.ts, sitemap.ts, llms.txt/route.ts, opengraph-image.tsx
│  ├─ app/.well-known/vercel/flags/route.ts      Flags Explorer
│  ├─ proxy.ts (or middleware.ts)  locale redirect + visitor_id + experiment precompute rewrite
│  ├─ components/layout/          HARD-CODED chrome: Header, Footer, LanguageSwitcher, SkipLink
│  ├─ components/blocks/          CMS-DRIVEN: Hero, FeatureGrid, PricingTable,
│  │                              TestimonialCarousel, CtaBanner, Faq, LeadForm, BlockRenderer
│  ├─ components/ui/              primitives: Button, Container, Section, RichText
│  ├─ lib/sanity/                 client.ts, fetch.ts (sanityFetch w/ tags), queries.ts (defineQuery)
│  ├─ lib/seo/                    metadata.ts, jsonld.ts (schema-dts), hreflang.ts
│  ├─ lib/i18n/                   config.ts, dictionaries/{en,es}.ts
│  ├─ lib/analytics/              events.ts (typed union), trackEvent.ts, consent.ts, ClickTracker
│  ├─ lib/experiments/            flags.ts, precompute.ts, ClientExperiment.tsx
│  └─ lib/forms/leadSchema.ts     shared Zod schema
├─ apps/studio/                   Sanity Studio 6
│  ├─ sanity.config.ts            structure (singletons), documentInternationalization plugin, vision
│  ├─ schemas/documents/          page, siteSettings, navigation
│  ├─ schemas/objects/            seo, cta, link, blocks/{hero,featureGrid,pricingTable,
│  │                              testimonialCarousel,ctaBanner,faq,leadForm}
│  └─ scripts/seed.ts             sample en pages + es home, run via `sanity exec --with-user-token`
└─ packages/sanity-types/         Sanity TypeGen output (schema + GROQ result types)
```

**CMS vs code:** code owns chrome and every block's rendering/design; Sanity owns which blocks, their order, and content. Nav _links_ come from Sanity, header _layout_ is code.

### Content model

- `page`: title, slug, language, `seo`, `blocks[]` (array of block objects → page builder, drag to reorder).
- `siteSettings` / `navigation`: singletons per language (org info for JSON-LD, default SEO, GTM override; header links + footer columns of nested `link`).
- Blocks: `hero` (eyebrow, heading, rich body, image+alt, `cta[]`), `featureGrid` (`features[]`), `pricingTable` (`tiers[]` → name/price/interval/features/cta/highlighted), `testimonialCarousel` (`testimonials[]`), `ctaBanner`, `faq` (`items[]` q + rich answer), `leadForm` (heading, portalId/formId, success msg). Shared: `cta` (label, link, variant), `link` (internal reference | external URL), `seo` (title, desc, ogImage, noindex).

### Data flow

- Page route: GROQ by slug + language (fallback en) → `sanityFetch` with `next.tags` (`page:<lang>:<slug>`, `type:page`) + long `revalidate` backstop → `generateStaticParams` for every slug × locale → `BlockRenderer` typed registry by `_type` (unknown type = nothing in prod, warning in dev).
- Publish → Sanity GROQ-powered webhook (page/siteSettings/navigation) → `POST /api/revalidate` → `parseBody` (next-sanity) HMAC verify with `SANITY_REVALIDATE_SECRET` → `revalidateTag` (settings/nav changes invalidate `type:*`, cascading). No rebuild.

### Enterprise features

- **i18n:** all URLs prefixed; proxy redirects prefix-less paths via `NEXT_LOCALE` cookie → `Accept-Language` → `en`. Language switcher uses translation metadata, falls back to locale home.
- **SEO/AEO:** `generateMetadata` (title template, canonical, `alternates.languages` incl. `x-default` only for existing translations, OG/Twitter, `next/og` image); `sitemap.ts` with hreflang; `robots.ts` allows GPTBot/ClaudeBot/PerplexityBot/Google-Extended and emits noindex on non-production `VERCEL_ENV`; JSON-LD: Organization + WebSite (site), WebPage + BreadcrumbList (page), FAQPage (auto from `faq`), Product/Offer (from `pricingTable`); `/llms.txt` generated from published pages.
- **Marketing ops:** GTM via `@next/third-parties` when `NEXT_PUBLIC_GTM_ID` set, Consent Mode v2 defaults (denied) before load; typed `trackEvent()` → `dataLayer` or console when GTM off; `data-track` + one delegated click listener; Lead form = Server Action + shared Zod schema + honeypot + UTM/`hutk` capture → HubSpot Forms v3 API if `HUBSPOT_PORTAL_ID`/form GUID set, else dry-run log; server returns field errors.
- **Experimentation:** stable `visitor_id` cookie; Flags SDK flags with deterministic hash bucketing; `precompute` rewrite to `/[code]/...` so each variant is static/cached (no flicker) — demo: homepage hero headline A/B; `experiment_exposure` event; Flags Explorer endpoint for forcing variants on previews; `<ClientExperiment>` client-side contrast example (README explains flicker trade-off).
- **Security baseline:** headers in `next.config` (HSTS, nosniff, Referrer-Policy, frame-ancestors) + Dependabot.

### Workflow / CI

- Trunk-based: `main` = production; short-lived `feat/*`, `fix/*`, `content-model/*`; squash merge. Content publishes need no PR (webhook path) — code/schema only via Git.
- Vercel Git integration: preview per PR, prod on `main`.
- `.github/workflows/ci.yml` (PR): frozen install, lint, typecheck, typegen-drift check, build web + studio (turbo cache).
- `.github/workflows/deploy-studio.yml` (push to main, `apps/studio/**`): `sanity deploy` with `SANITY_AUTH_TOKEN` repo secret (user adds).
- `CODEOWNERS` (`apps/studio/schemas/**`, proxy/middleware → owner), PR template with QA checklist, `dependabot.yml` (weekly, grouped).
- Branch protection (via `gh api` as adamcantcode): PR required, CI required, up-to-date, 0 approvals; README documents team setting (1 approval + CODEOWNERS).
- README also documents schema-safe deploy order (additive → dual-read code → migrate → remove).

## Build steps (inline execution in this session — user actions interleave)

Checkpoints marked **[USER]** need you; **[ASK]** = I pause for explicit permission.

1. **[ASK]** Create the GitHub repo: `gh auth switch -u adamcantcode` → `gh repo create adamcantcode/vercel-testing --public --add-readme` → `gh auth switch -u amacaulay-ch`. Clone via `git@github-personal:…` into `~/Sites/vercel-testing`, set repo-local identity, branch `feat/initial-build` (GitHub creates `main`, so no local commits land on main).
2. Monorepo scaffold: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.gitignore`, shared tsconfig/eslint/prettier.
3. **[USER]** `pnpm dlx sanity login` (personal account). Then I run `sanity init` non-interactively to create project `vercel-testing`, dataset `production`, into `apps/studio`.
4. Studio: schemas, structure (singletons), i18n plugin, TypeGen config → `packages/sanity-types`.
5. Seed script (Acme placeholder content: home, pricing, features, contact en; home es; settings + nav en/es). Run it; confirm in Studio.
6. `apps/web` via `create-next-app` (TS, Tailwind 4, App Router, no src dir), then `lib/sanity`, `lib/i18n`, proxy locale routing, layout chrome, BlockRenderer + 7 blocks, UI primitives.
7. SEO/AEO: metadata, JSON-LD builders, sitemap, robots, llms.txt, OG image.
8. Marketing ops: consent + GTM, trackEvent, click tracker, lead Server Action + form.
9. Experiments: flags, precompute route segment, Flags Explorer endpoint, ClientExperiment.
10. `/api/revalidate` route.
11. Repo hygiene: CI + studio deploy workflows, CODEOWNERS, PR template, Dependabot, security headers, README (local dev, content→Vercel webhook flow, branching + CI gate, env var table, Phase 2 backlog) + `docs/superpowers/specs/2026-09-28-vercel-testing-design.md` (this spec).
12. Local verification (below), commit in logical chunks with Co-Authored-By trailer.
13. **[ASK]** Push `feat/initial-build`, open PR → CI runs.
14. **[USER]** `vercel login` (personal GitHub); import repo in Vercel (root `apps/web`) or `vercel link`; **[USER]** `vercel env add SANITY_REVALIDATE_SECRET`. I run `sanity cors add` for localhost + Vercel domains, give exact webhook values for you to create in sanity.io/manage (URL, filter `_type in ["page","siteSettings","navigation"]`, projection, secret), **[USER]** add `SANITY_AUTH_TOKEN` GitHub secret, `sanity deploy` Studio.
15. **[ASK]** Apply branch protection, merge PR → production deploy → end-to-end check.

## Verification

- `pnpm lint && pnpm typecheck && pnpm build` green at root.
- Dev server + chrome-devtools MCP: every block renders on `/en` and `/es`; view-source has hreflang, canonical, OG, JSON-LD (validate structure); lead form shows server-side field errors and dry-run log on success; `dataLayer` receives `cta_click`/`experiment_exposure`.
- curl: `/` → 307 `/en`; `Accept-Language: es` → `/es`; bad webhook signature → 401; different `visitor_id` cookies → both hero headlines; `/robots.txt`, `/sitemap.xml`, `/llms.txt` correct.
- Post-deploy: PR shows Vercel preview + passing CI; preview has `noindex`; edit headline in Studio → publish → production URL updates within seconds without redeploy (check Vercel deployments list unchanged).

## Phase 2 backlog (after initial build, pick together)

Draft Mode + Visual Editing (Presentation tool) · staging dataset/environment · Playwright smoke + Lighthouse CI against preview URLs · CMS-managed redirects · cookie consent banner · full CSP.
