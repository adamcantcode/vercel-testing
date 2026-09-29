import type { PAGE_QUERY_RESULT } from 'sanity-types'

/** Convenience types derived from the generated query result types. */
export type Page = NonNullable<PAGE_QUERY_RESULT>
export type PageBlock = NonNullable<Page['blocks']>[number]
export type BlockType = PageBlock['_type']
export type BlockOf<T extends BlockType> = Extract<PageBlock, { _type: T }>
export type RichTextValue = NonNullable<BlockOf<'hero'>['body']>
export type Cta = NonNullable<BlockOf<'hero'>['ctas']>[number]
export type SanityImage = NonNullable<BlockOf<'hero'>['image']>
