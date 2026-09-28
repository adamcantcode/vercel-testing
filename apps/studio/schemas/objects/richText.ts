import { defineArrayMember, defineType } from 'sanity'

/**
 * Deliberately small Portable Text config: paragraphs, H3, lists, bold/italic,
 * and links. Headings above H3 are omitted so editors can't break the page's
 * heading hierarchy (each block owns its own H2).
 */
export const richText = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading', value: 'h3' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [{ name: 'link', type: 'link' }],
      },
    }),
  ],
})
