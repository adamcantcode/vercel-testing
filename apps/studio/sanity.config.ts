import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { documentInternationalization } from '@sanity/document-internationalization'
import { dataset, languages, projectId, singletonTypes } from './lib/config'
import { schemaTypes } from './schemas'
import { structure } from './structure'

export default defineConfig({
  name: 'default',
  title: 'Acme Marketing',
  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    // Document-level i18n: each translation is its own `page` document,
    // linked through a `translation.metadata` document. Good for pages whose
    // structure can differ per market (different blocks, different order).
    documentInternationalization({
      supportedLanguages: [...languages],
      schemaTypes: ['page'],
    }),
    // GROQ playground at /vision, handy for testing queries from apps/web.
    visionTool({ defaultApiVersion: '2025-01-01' }),
  ],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      // Hide the generic singleton templates so "Create new" can't make duplicates.
      ...prev.filter(
        (t) => !singletonTypes.includes(t.schemaType as (typeof singletonTypes)[number]),
      ),
      {
        id: 'page-by-language',
        title: 'Page in language',
        schemaType: 'page',
        parameters: [{ name: 'lang', type: 'string' }],
        value: (params: { lang: string }) => ({ language: params.lang }),
      },
    ],
  },

  document: {
    // Singletons can't be duplicated or deleted from the document menu.
    actions: (prev, { schemaType }) =>
      singletonTypes.includes(schemaType as (typeof singletonTypes)[number])
        ? prev.filter(
            ({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : prev,
  },
})
