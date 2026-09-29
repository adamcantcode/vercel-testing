import { z } from 'zod'

/**
 * The single source of truth for the lead form, imported by BOTH the client
 * component (instant feedback) and the Server Action (the real gate). Client
 * validation is a UX nicety; the server never trusts it.
 *
 * Error messages are dictionary KEYS, not English, so the UI can localize them.
 */
export type LeadErrorKey = 'required' | 'email' | 'tooLong'

const required = (max: number) =>
  z
    .string({ error: 'required' })
    .trim()
    .min(1, { error: 'required' })
    .max(max, { error: 'tooLong' })

export const leadSchema = z.object({
  firstName: required(80),
  lastName: required(80),
  email: z
    .string({ error: 'required' })
    .trim()
    .min(1, { error: 'required' })
    .pipe(z.email({ error: 'email' })),
  company: required(120),
  message: z.string().trim().max(2000, { error: 'tooLong' }).optional().default(''),
})

export type LeadInput = z.infer<typeof leadSchema>
export type LeadField = keyof LeadInput
export type LeadFieldErrors = Partial<Record<LeadField, LeadErrorKey>>

/** Attribution fields captured silently alongside the visible fields. */
export const attributionFields = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
] as const

export function toFieldErrors(error: z.ZodError): LeadFieldErrors {
  const out: LeadFieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as LeadField
    if (!out[field]) out[field] = issue.message as LeadErrorKey
  }
  return out
}
