import { defineField, defineType } from 'sanity'
import { LinkIcon } from '@sanity/icons/Link'

/**
 * A link is EITHER an internal reference to a page (survives slug renames,
 * resolved to a URL at query time) OR an external URL. Editors never type
 * internal URLs by hand, so a renamed page can't leave broken links behind.
 */
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'type',
      type: 'string',
      options: { list: ['internal', 'external'], layout: 'radio', direction: 'horizontal' },
      initialValue: 'internal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'internal',
      title: 'Page',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.type !== 'internal',
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          return parent?.type === 'internal' && !value ? 'Choose a page' : true
        }),
    }),
    defineField({
      name: 'external',
      title: 'URL',
      type: 'url',
      hidden: ({ parent }) => parent?.type !== 'external',
      validation: (rule) =>
        rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }).custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          return parent?.type === 'external' && !value ? 'Enter a URL' : true
        }),
    }),
    defineField({
      name: 'anchor',
      title: 'Section anchor',
      description: 'Optional #id to jump to on the target page, without the "#".',
      type: 'string',
    }),
  ],
})

/** A labelled link used in navigation menus. */
export const navLink = defineType({
  name: 'navLink',
  title: 'Navigation link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(40) }),
    defineField({ name: 'link', type: 'link', validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'link.external' } },
})
