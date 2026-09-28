import { defineArrayMember, defineField, defineType } from 'sanity'
import { ThLargeIcon } from '@sanity/icons/ThLarge'

/** Nested content example: block → array of feature objects → rich text. */
export const featureGrid = defineType({
  name: 'featureGrid',
  title: 'Feature grid',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      description: 'Optional, for #links.',
      type: 'slug',
    }),
    defineField({ name: 'heading', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      type: 'number',
      options: { list: [2, 3, 4], layout: 'radio', direction: 'horizontal' },
      initialValue: 3,
    }),
    defineField({
      name: 'features',
      type: 'array',
      validation: (rule) => rule.required().min(2).max(12),
      of: [
        defineArrayMember({
          name: 'feature',
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              description: 'Picked from the design system icon set.',
              type: 'string',
              options: { list: ['bolt', 'shield', 'chart', 'globe', 'sparkles', 'users'] },
              initialValue: 'sparkles',
            }),
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required().max(50),
            }),
            defineField({ name: 'body', type: 'richText' }),
          ],
          preview: { select: { title: 'title', subtitle: 'icon' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', features: 'features' },
    prepare: ({ title, features }) => ({
      title,
      subtitle: `Feature grid · ${features?.length ?? 0} features`,
    }),
  },
})
