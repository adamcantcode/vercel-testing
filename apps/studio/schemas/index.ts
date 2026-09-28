import { navigation } from './documents/navigation'
import { page } from './documents/page'
import { siteSettings } from './documents/siteSettings'
import { blocks } from './objects/blocks'
import { cta } from './objects/cta'
import { link, navLink } from './objects/link'
import { richText } from './objects/richText'
import { seo } from './objects/seo'

export const schemaTypes = [
  // Documents
  page,
  siteSettings,
  navigation,
  // Reusable objects
  link,
  navLink,
  cta,
  seo,
  richText,
  // Page-builder blocks
  ...blocks,
]
