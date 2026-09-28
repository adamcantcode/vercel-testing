import type { StructureResolver } from 'sanity/structure'
import { CogIcon } from '@sanity/icons/Cog'
import { DocumentsIcon } from '@sanity/icons/Documents'
import { MenuIcon } from '@sanity/icons/Menu'
import { languages, singletonId } from './lib/config'

/**
 * Custom desk structure: pages grouped by language, and per-language
 * singletons (settings, navigation) opened by fixed ID so editors can't
 * create duplicates.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages by language')
            .items(
              languages.map((lang) =>
                S.listItem()
                  .id(`pages-${lang.id}`)
                  .title(`Pages (${lang.title})`)
                  .child(
                    S.documentList()
                      .id(`pages-${lang.id}`)
                      .title(`Pages (${lang.title})`)
                      .schemaType('page')
                      .filter('_type == "page" && language == $lang')
                      .params({ lang: lang.id })
                      .initialValueTemplates([
                        S.initialValueTemplateItem('page-by-language', { lang: lang.id }),
                      ]),
                  ),
              ),
            ),
        ),
      S.divider(),
      ...languages.flatMap((lang) => [
        S.listItem()
          .id(singletonId('siteSettings', lang.id))
          .title(`Site settings (${lang.title})`)
          .icon(CogIcon)
          .child(
            S.document()
              .schemaType('siteSettings')
              .documentId(singletonId('siteSettings', lang.id)),
          ),
        S.listItem()
          .id(singletonId('navigation', lang.id))
          .title(`Navigation (${lang.title})`)
          .icon(MenuIcon)
          .child(
            S.document().schemaType('navigation').documentId(singletonId('navigation', lang.id)),
          ),
      ]),
    ])
