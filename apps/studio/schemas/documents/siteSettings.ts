import { defineArrayMember, defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons/Cog'

/**
 * Global, per-language settings. One document per locale with a fixed ID
 * (`siteSettings-en`, `siteSettings-es`), opened directly from the Studio
 * structure so editors can't create duplicates.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true }),
    defineField({ name: 'siteName', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      description: 'Fallbacks for pages that leave their own SEO fields empty.',
      type: 'seo',
    }),
    defineField({
      name: 'organization',
      description: 'Used for schema.org Organization structured data (search + AI answer engines).',
      type: 'object',
      fields: [
        defineField({ name: 'legalName', type: 'string' }),
        defineField({ name: 'logo', type: 'image' }),
        defineField({ name: 'contactEmail', type: 'string', validation: (rule) => rule.email() }),
        defineField({
          name: 'sameAs',
          title: 'Social profiles',
          description: 'Official profile URLs (LinkedIn, X, GitHub…).',
          type: 'array',
          of: [defineArrayMember({ type: 'url' })],
        }),
      ],
    }),
    defineField({
      name: 'gtmContainerId',
      title: 'GTM container ID',
      description:
        'Optional override for the NEXT_PUBLIC_GTM_ID env var, e.g. GTM-XXXXXXX. Changing this affects tracking on every page.',
      type: 'string',
      validation: (rule) => rule.regex(/^GTM-[A-Z0-9]+$/, { name: 'GTM container ID' }).warning(),
    }),
  ],
  preview: {
    select: { title: 'siteName', language: 'language' },
    prepare: ({ title, language }) => ({ title, subtitle: `Site settings · ${language}` }),
  },
})
