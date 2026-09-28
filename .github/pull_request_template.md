## What & why

<!-- One or two sentences. Link the ticket/brief. -->

## Type

- [ ] New/changed block component
- [ ] Schema change (Studio)
- [ ] Routing / proxy / i18n
- [ ] Analytics / experiments / forms
- [ ] Chore / deps

## QA on the Vercel preview

- [ ] Affected pages render in **/en** and **/es** (and the fallback notice appears where expected)
- [ ] Keyboard-only pass: focus visible, skip link works, no traps
- [ ] View source: one `<h1>`, canonical + hreflang correct, JSON-LD present where expected
- [ ] Events appear in the console / GTM preview with the documented fields
- [ ] Mobile width (390px) checked

## Schema changes only

- [ ] Change is **additive** (no field removed/renamed in the same PR as code that stops reading it)
- [ ] `pnpm typegen` run and committed
- [ ] Existing content migrated or still valid

## Screenshots / preview link
