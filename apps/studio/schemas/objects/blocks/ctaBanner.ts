import { defineArrayMember, defineField, defineType } from 'sanity'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'

export const ctaBanner = defineType({
  name: 'ctaBanner',
  title: 'CTA banner',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({ name: 'heading', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'body', type: 'text', rows: 2 }),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
      validation: (rule) => rule.required().min(1).max(2),
    }),
    defineField({
      name: 'tone',
      type: 'string',
      options: { list: ['brand', 'dark', 'light'], layout: 'radio', direction: 'horizontal' },
      initialValue: 'brand',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title, subtitle: 'CTA banner' }),
  },
})
