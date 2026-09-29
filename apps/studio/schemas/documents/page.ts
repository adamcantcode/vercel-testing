import { defineArrayMember, defineField, defineType, type SlugValidationContext } from 'sanity'
import { DocumentIcon } from '@sanity/icons/Document'
import { blockTypeNames } from '../objects/blocks'

/**
 * Slugs only need to be unique within a language: /en/pricing and
 * /es/pricing are both allowed to use the slug "pricing".
 */
async function isUniquePerLanguage(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context
  const id = document?._id.replace(/^drafts\./, '')
  const count = await getClient({ apiVersion: '2025-01-01' }).fetch<number>(
    `count(*[_type == "page" && slug.current == $slug && language == $language && !(_id in [$draft, $published])])`,
    { slug, language: document?.language ?? null, draft: `drafts.${id}`, published: id },
  )
  return count === 0
}

/**
 * A marketing page. The page builder is the `blocks` array: editors add,
 * reorder, and configure blocks from a fixed palette. The slug "home" is the
 * locale's root URL (/en, /es).
 */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      description: 'Internal name and default SEO title.',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      description:
        'URL path segment. Use "home" for the homepage. Nested paths like "solutions/enterprise" are allowed.',
      type: 'slug',
      group: 'content',
      options: { source: 'title', isUnique: isUniquePerLanguage },
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value?.current && !/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(value.current)
              ? 'Use lowercase letters, numbers, hyphens, and "/" only'
              : true,
          ),
    }),
    // Managed by @sanity/document-internationalization; editors switch
    // language with the "Translations" menu instead of editing this field.
    defineField({ name: 'language', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'blocks',
      title: 'Page builder',
      type: 'array',
      group: 'content',
      of: blockTypeNames.map((type) => defineArrayMember({ type })),
      options: {
        insertMenu: {
          views: [{ name: 'list' }, { name: 'grid' }],
        },
      },
    }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language' },
    prepare: ({ title, slug, language }) => ({
      title,
      subtitle: `/${language ?? '??'}/${slug === 'home' ? '' : (slug ?? '')}`,
    }),
  },
})
