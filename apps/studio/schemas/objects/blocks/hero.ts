import { defineArrayMember, defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons/Rocket'

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  fieldsets: [{ name: 'experiment', title: 'A/B experiment', options: { collapsible: true } }],
  fields: [
    defineField({ name: 'eyebrow', type: 'string', validation: (rule) => rule.max(40) }),
    defineField({
      name: 'heading',
      description: 'Rendered as the page H1 when this hero is the first block.',
      type: 'string',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({ name: 'body', type: 'richText' }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) =>
            rule.custom((alt, ctx) => {
              const image = ctx.parent as { asset?: unknown } | undefined
              return image?.asset && !alt ? 'Alt text is required for accessibility' : true
            }),
        }),
      ],
    }),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
      validation: (rule) => rule.max(2),
    }),
    // CMS-authored experiment copy. Code decides WHO sees it (see
    // apps/web/lib/experiments/flags.ts); marketing decides WHAT it says.
    defineField({
      name: 'headingVariantB',
      title: 'Heading, variant B',
      description:
        'Shown to visitors bucketed into variant B of the "hero-headline" experiment. Leave empty to show the default heading to everyone.',
      type: 'string',
      fieldset: 'experiment',
      validation: (rule) => rule.max(90),
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: `Hero · ${subtitle ?? ''}`,
      media,
    }),
  },
})
