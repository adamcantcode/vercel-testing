/**
 * Design-system icon set. The CMS stores an icon NAME from a closed list
 * (see featureGrid schema); code owns the artwork.
 */
const paths = {
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  globe:
    'M12 21a9 9 0 1 0 0-18m0 18a9 9 0 1 1 0-18m0 18c2.5-2.5 3.5-5.5 3.5-9S14.5 5.5 12 3m0 18c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3M3.5 9h17m-17 6h17',
  sparkles: 'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6',
  users:
    'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1m20 0v-1a4 4 0 0 0-3-3.9M15 3.1a4 4 0 0 1 0 7.8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
} as const

export type IconName = keyof typeof paths

export function Icon({
  name,
  className = 'h-6 w-6',
}: {
  name: IconName | null | undefined
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name ?? 'sparkles']} />
    </svg>
  )
}
