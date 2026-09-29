'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

/** The only client JS in the header: a disclosure toggle for small screens. */
export function MobileMenu({
  children,
  openLabel,
  closeLabel,
}: {
  children: ReactNode
  openLabel: string
  closeLabel: string
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  // Close after navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 ring-1 ring-line"
      >
        <span className="sr-only">{open ? closeLabel : openLabel}</span>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} />
        </svg>
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-white px-5 py-4 shadow-lg"
      >
        {children}
      </div>
    </div>
  )
}
