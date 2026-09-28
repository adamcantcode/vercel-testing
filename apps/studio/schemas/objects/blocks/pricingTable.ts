import { defineArrayMember, defineField, defineType } from 'sanity'
import { CreditCardIcon } from '@sanity/icons/CreditCard'

/**
 * Pricing tiers. Also emitted as schema.org Product/Offer JSON-LD so answer
 * engines can quote accurate prices (see apps/web/lib/seo/jsonld.ts).
 */
export const pricingTable = defineType({
  name: 'pricingTable',
  title: 'Pricing table',
  type: 'object',
  icon: CreditCardIcon,
  fields: [
    defineField({ name: 'heading', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({
      name: 'currency',
      type: 'string',
      options: { list: ['USD', 'EUR', 'GBP'] },
      initialValue: 'USD',
    }),
    defineField({
      name: 'tiers',
      type: 'array',
      validation: (rule) => rule.required().min(1).max(4),
      of: [
        defineArrayMember({
          name: 'tier',
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'price',
              description: 'Leave empty for "Contact us" tiers.',
              type: 'number',
              validation: (rule) => rule.min(0),
            }),
            defineField({
              name: 'interval',
              type: 'string',
              options: { list: ['month', 'year', 'one-time'] },
              initialValue: 'month',
            }),
            defineField({ name: 'description', type: 'string' }),
            defineField({
              name: 'features',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
            defineField({ name: 'cta', type: 'cta' }),
            defineField({
              name: 'highlighted',
              title: 'Highlight as recommended',
              type: 'boolean',
            }),
          ],
          preview: {
            select: { title: 'name', price: 'price', interval: 'interval' },
            prepare: ({ title, price, interval }) => ({
              title,
              subtitle: price == null ? 'Contact us' : `${price} / ${interval}`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', tiers: 'tiers' },
    prepare: ({ title, tiers }) => ({ title, subtitle: `Pricing · ${tiers?.length ?? 0} tiers` }),
  },
})
