import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './lib/config'

export default defineCliConfig({
  api: { projectId, dataset },
  // Deployed to https://<studioHost>.sanity.studio by `pnpm --filter studio deploy`.
  studioHost: 'acme-vercel-testing',
  deployment: { autoUpdates: true },
  // `pnpm typegen`: extract schema → scan apps/web for defineQuery() calls →
  // write types into the shared workspace package.
  typegen: {
    path: '../web/{app,components,lib}/**/*.{ts,tsx}',
    schema: './schema.json',
    generates: '../../packages/sanity-types/src/index.ts',
    overloadClientMethods: false,
  },
})
