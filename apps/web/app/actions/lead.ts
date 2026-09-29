'use server'

import { headers } from 'next/headers'
import {
  attributionFields,
  leadSchema,
  toFieldErrors,
  type LeadFieldErrors,
} from '@/lib/forms/leadSchema'

export type LeadFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      fieldErrors?: LeadFieldErrors
      formError?: 'generic'
      /** Echoed back so React's post-action form reset doesn't wipe what the user typed. */
      values?: Record<string, string>
    }

/**
 * Lead capture Server Action ("HubSpot-style").
 *
 * 1. Honeypot: bots fill every field, humans never see `website`.
 * 2. Validate with the SAME Zod schema the client uses; the server is the gate.
 * 3. Forward to the HubSpot Forms Submissions API v3 when configured,
 *    otherwise log a redacted dry-run so local dev works with no account.
 *
 * Server Actions are public POST endpoints: never trust hidden fields for
 * anything security-relevant, and never log raw PII.
 */
export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  if (formData.get('website')) return { status: 'success' } // honeypot: pretend it worked

  const raw = Object.fromEntries(formData)
  const values = { firstName: '', lastName: '', email: '', company: '', message: '' }
  for (const k of Object.keys(values) as (keyof typeof values)[]) values[k] = String(raw[k] ?? '')

  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) return { status: 'error', fieldErrors: toFieldErrors(parsed.error), values }
  const lead = parsed.data

  const attribution = Object.fromEntries(
    attributionFields.map((k) => [k, String(formData.get(k) ?? '')]).filter(([, v]) => v),
  )
  const pageUri = String(formData.get('pageUri') ?? '')
  const hutk = String(formData.get('hutk') ?? '') || undefined
  const formGuid =
    String(formData.get('formId') ?? '') === 'default'
      ? process.env.HUBSPOT_FORM_ID
      : String(formData.get('formId'))
  const portalId = process.env.HUBSPOT_PORTAL_ID

  const payload = {
    fields: [
      { name: 'firstname', value: lead.firstName },
      { name: 'lastname', value: lead.lastName },
      { name: 'email', value: lead.email },
      { name: 'company', value: lead.company },
      { name: 'message', value: lead.message },
      // Custom HubSpot contact properties must exist with these internal names.
      ...Object.entries(attribution).map(([name, value]) => ({ name, value })),
    ],
    context: {
      hutk, // HubSpot tracking cookie: ties the submission to prior page views
      pageUri,
      ipAddress: (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim(),
    },
  }

  if (!portalId || !formGuid) {
    // Redacted: field NAMES and the email domain only. Assume form data is PII.
    console.info('[lead] dry run (set HUBSPOT_PORTAL_ID + HUBSPOT_FORM_ID to send)', {
      fields: payload.fields.map((f) => f.name),
      emailDomain: lead.email.split('@')[1],
      attribution,
      pageUri,
    })
    return { status: 'success' }
  }

  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    )
    if (!res.ok) {
      console.error('[lead] HubSpot rejected submission', res.status)
      return { status: 'error', formError: 'generic', values }
    }
    return { status: 'success' }
  } catch (err) {
    console.error('[lead] HubSpot request failed', err instanceof Error ? err.message : err)
    return { status: 'error', formError: 'generic', values }
  }
}
