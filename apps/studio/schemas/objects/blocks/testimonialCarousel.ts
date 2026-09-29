import { defineArrayMember, defineField, defineType } from 'sanity'
import { CommentIcon } from '@sanity/icons/Comment'

export const testimonialCarousel = defineType({
  name: 'testimonialCarousel',
  title: 'Testimonial carousel',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({ name: 'heading', type: 'string', validation: (rule) => rule.max(80) }),
    defineField({
      name: 'testimonials',
      type: 'array',
      validation: (rule) => rule.required().min(1).max(10),
      of: [
        defineArrayMember({
          name: 'testimonial',
          type: 'object',
          fields: [
            defineField({
              name: 'quote',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required().max(400),
            }),
            defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'role', type: 'string' }),
            defineField({ name: 'company', type: 'string' }),
            defineField({
              name: 'avatar',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
            }),
          ],
          preview: { select: { title: 'name', subtitle: 'company', media: 'avatar' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'testimonials' },
    prepare: ({ title, items }) => ({
      title: title || 'Testimonials',
      subtitle: `Testimonials · ${items?.length ?? 0}`,
    }),
  },
})
