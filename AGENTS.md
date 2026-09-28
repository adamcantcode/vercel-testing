# Agent guide: vercel-testing

pnpm + Turborepo monorepo: `apps/web` (Next.js 16), `apps/studio` (Sanity Studio 6), `packages/sanity-types` (generated).

## Before running anything

- `source ~/.nvm/nvm.sh && nvm use` (Node 22.19+ required; `.nvmrc` pins it).
- Never read or write `.env*` files. Secrets live in Vercel / GitHub secrets; see README "Environment variables".
- Next.js 16 differs from older versions: read `apps/web/AGENTS.md` and the docs in `apps/web/node_modules/next/dist/docs/` before changing routing, caching, or the proxy.

## Verify every change

- `pnpm verify` (lint + typecheck + build). The web build needs `FLAGS_SECRET` in the environment.
- Changed a schema or a GROQ query? Run `pnpm typegen` and commit `packages/sanity-types` and `apps/studio/schema.json` (CI fails on drift).

## Conventions

- GROQ lives only in `apps/web/lib/sanity/queries.ts` (wrapped in `defineQuery`) so TypeGen can find it.
- All Sanity reads go through `sanityFetch()` with a cache tag; new document types need a tag + webhook filter entry.
- New block = schema in `apps/studio/schemas/objects/blocks/` + projection in `PAGE_QUERY` + component in `components/blocks/registry.tsx`.
- Schema changes are additive (expand → migrate → contract). Never remove a field in the same PR as the code that stops reading it.
- Analytics events must be added to the `AnalyticsEvent` union; never send field values (PII), only names.
- `@sanity/icons` v5: import icons from subpaths (`@sanity/icons/Cog`), not the root.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
