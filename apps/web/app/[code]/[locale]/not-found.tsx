import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { en } from '@/lib/i18n/dictionaries/en'

/*
 * not-found.tsx can't read route params, so this is English-only. The
 * header/footer around it are still localized by the layout.
 */
export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{en.notFoundTitle}</h1>
      <p className="mt-4 text-ink-soft">{en.notFoundBody}</p>
      <div className="mt-8">
        <ButtonLink href="/">{en.backHome}</ButtonLink>
      </div>
    </Container>
  )
}
