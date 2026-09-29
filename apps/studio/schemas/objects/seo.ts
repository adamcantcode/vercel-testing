import { defineField, defineType } from 'sanity'

/**
 * Per-page SEO overrides. Everything is optional: the web app falls back to
 * the page title and Site Settings defaults (see apps/web/lib/seo/metadata.ts).
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      description: 'Shown in search results and browser tabs. Aim for 50–60 characters.',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Titles over 70 characters get truncated'),
    }),
    defineField({
      name: 'description',
      description:
        'Search result snippet and AI answer-engine summary. Aim for 120–160 characters.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(180).warning('Descriptions over 180 characters get truncated'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      description: 'Optional. 1200×630. If empty, a branded image is generated automatically.',
      type: 'image',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
