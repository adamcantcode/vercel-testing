import { defineField, defineType } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons/Envelope'

/**
 * Lead capture form. Field layout and validation live in code (a shared Zod
 * schema) so marketing can't create a form the CRM can't accept. Sanity only
 * controls copy and which HubSpot form the submission goes to.
 */
export const leadForm = defineType({
  name: 'leadForm',
  title: 'Lead form',
  type: 'object',
  icon: EnvelopeIcon,
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
      name: 'hubspotFormId',
      title: 'HubSpot form GUID',
      description: 'Optional. If empty, the site-wide default form is used (HUBSPOT_FORM_ID).',
      type: 'string',
    }),
    defineField({ name: 'submitLabel', type: 'string', initialValue: 'Request a demo' }),
    defineField({
      name: 'successMessage',
      type: 'string',
      initialValue: "Thanks! We'll be in touch within one business day.",
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title, subtitle: 'Lead form' }),
  },
})
