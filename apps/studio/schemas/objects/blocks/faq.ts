import { defineArrayMember, defineField, defineType } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'

/**
 * FAQ block. Any page with this block automatically emits FAQPage JSON-LD,
 * which is one of the most reliable ways to get quoted by AI answer engines.
 * Write answers as complete, standalone sentences.
 */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'heading', type: 'string', initialValue: 'Frequently asked questions' }),
    defineField({
      name: 'items',
      type: 'array',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'faqItem',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              type: 'richText',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare: ({ title, items }) => ({ title, subtitle: `FAQ · ${items?.length ?? 0} questions` }),
  },
})
