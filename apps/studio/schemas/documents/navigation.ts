import { defineArrayMember, defineField, defineType } from 'sanity'
import { MenuIcon } from '@sanity/icons/Menu'

/**
 * Header and footer link lists, one document per locale. This controls
 * WHICH links appear; the header/footer LAYOUT is hard-coded in
 * apps/web/components/layout so it can't be broken from the CMS.
 */
export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({ name: 'language', type: 'string', readOnly: true }),
    defineField({
      name: 'header',
      title: 'Header links',
      type: 'array',
      of: [defineArrayMember({ type: 'navLink' })],
      validation: (rule) => rule.max(6).warning('More than 6 header links crowds mobile layouts'),
    }),
    defineField({ name: 'headerCta', title: 'Header button', type: 'cta' }),
    defineField({
      name: 'footerColumns',
      type: 'array',
      validation: (rule) => rule.max(4),
      of: [
        defineArrayMember({
          name: 'footerColumn',
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'links',
              type: 'array',
              of: [defineArrayMember({ type: 'navLink' })],
            }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
    defineField({ name: 'legal', title: 'Footer legal text', type: 'string' }),
  ],
  preview: {
    select: { language: 'language' },
    prepare: ({ language }) => ({ title: 'Navigation', subtitle: language }),
  },
})
