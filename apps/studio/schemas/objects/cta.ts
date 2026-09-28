import { defineField, defineType } from 'sanity'
import { LaunchIcon } from '@sanity/icons/Launch'

/**
 * Call-to-action button. `variant` is a closed list so marketers pick from the
 * design system's button styles instead of inventing new ones.
 */
export const cta = defineType({
  name: 'cta',
  title: 'Call to action',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({ name: 'label', type: 'string', validation: (rule) => rule.required().max(32) }),
    defineField({ name: 'link', type: 'link', validation: (rule) => rule.required() }),
    defineField({
      name: 'variant',
      type: 'string',
      options: { list: ['primary', 'secondary'], layout: 'radio', direction: 'horizontal' },
      initialValue: 'primary',
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'variant' } },
})
