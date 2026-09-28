'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitLead, type LeadFormState } from '@/app/actions/lead'
import { buttonClass } from '@/components/ui/Button'
import { trackEvent } from '@/lib/analytics/trackEvent'
import {
  attributionFields,
  leadSchema,
  toFieldErrors,
  type LeadField,
  type LeadFieldErrors,
} from '@/lib/forms/leadSchema'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const ATTRIBUTION_KEY = 'lead_attribution'

/** First-touch attribution for the browser session: the landing page's UTMs win. */
function readAttribution(): Record<string, string> {
  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_KEY)
    if (stored) return JSON.parse(stored)
    const params = new URLSearchParams(window.location.search)
    const found = Object.fromEntries(
      attributionFields.map((k) => [k, params.get(k) ?? '']).filter(([, v]) => v),
    )
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(found))
    return found
  } catch {
    return {}
  }
}

export function LeadFormClient({
  formId,
  locale,
  dict,
  submitLabel,
  successMessage,
}: {
  formId: string
  locale: string
  dict: Dictionary['form']
  submitLabel: string
  successMessage: string
}) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, {
    status: 'idle',
  })
  const [clientErrors, setClientErrors] = useState<LeadFieldErrors>({})
  const [hidden, setHidden] = useState<Record<string, string>>({})
  const form = useRef<HTMLFormElement>(null)

  // Attribution + HubSpot cookie are browser-only, so they're captured after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden({
      ...readAttribution(),
      hutk: document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/)?.[1] ?? '',
      pageUri: window.location.href,
    })
  }, [])

  useEffect(() => {
    if (state.status === 'success') trackEvent({ event: 'generate_lead', form_id: formId, locale })
    if (state.status === 'error' && state.fieldErrors) {
      trackEvent({
        event: 'form_error',
        form_id: formId,
        error_fields: Object.keys(state.fieldErrors).join(','),
      })
    }
  }, [state, formId, locale])

  if (state.status === 'success') {
    return (
      <p role="status" className="rounded-2xl bg-white p-8 text-lg font-medium ring-1 ring-line">
        {successMessage}
      </p>
    )
  }

  // Server errors are authoritative; client errors give instant feedback.
  const errors: LeadFieldErrors = {
    ...clientErrors,
    ...(state.status === 'error' ? state.fieldErrors : {}),
  }

  function validateField(name: LeadField) {
    const data = Object.fromEntries(new FormData(form.current!))
    const result = leadSchema.safeParse(data)
    const fieldError = result.success ? undefined : toFieldErrors(result.error)[name]
    setClientErrors((prev) => ({ ...prev, [name]: fieldError }))
  }

  const field = (
    name: LeadField,
    label: string,
    opts: { type?: string; autoComplete?: string; optional?: boolean; textarea?: boolean } = {},
  ) => {
    const error = errors[name]
    const describedBy = error ? `${name}-error` : undefined
    const common = {
      id: name,
      name,
      autoComplete: opts.autoComplete,
      'aria-invalid': Boolean(error),
      'aria-describedby': describedBy,
      defaultValue: state.status === 'error' ? state.values?.[name] : undefined,
      onBlur: () => validateField(name),
      className: `mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-ink ${error ? 'border-red-600' : 'border-line'}`,
    }
    return (
      <div className={opts.textarea ? 'sm:col-span-2' : ''}>
        <label htmlFor={name} className="text-sm font-medium">
          {label} {opts.optional && <span className="text-ink-soft">({dict.optional})</span>}
        </label>
        {opts.textarea ? (
          <textarea rows={4} {...common} />
        ) : (
          <input type={opts.type ?? 'text'} {...common} />
        )}
        {/* Space is always reserved: if an error appeared on blur and pushed the
            submit button down, a click that started the blur would miss it. */}
        <p id={`${name}-error`} className="mt-1 min-h-5 text-sm text-red-700">
          {error ? dict.errors[error] : null}
        </p>
      </div>
    )
  }

  return (
    // noValidate: we render our own localized, accessible errors instead of browser bubbles.
    <form
      ref={form}
      action={action}
      noValidate
      className="grid gap-4 rounded-2xl bg-white p-8 ring-1 ring-line sm:grid-cols-2"
    >
      {field('firstName', dict.firstName, { autoComplete: 'given-name' })}
      {field('lastName', dict.lastName, { autoComplete: 'family-name' })}
      {field('email', dict.email, { type: 'email', autoComplete: 'email' })}
      {field('company', dict.company, { autoComplete: 'organization' })}
      {field('message', dict.message, { optional: true, textarea: true })}

      {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="formId" value={formId} />
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      {state.status === 'error' && state.formError && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
          {dict.genericError}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className={`${buttonClass('primary')} w-full disabled:opacity-60`}
        >
          {pending ? dict.submitting : submitLabel}
        </button>
      </div>
    </form>
  )
}
