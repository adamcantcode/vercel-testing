import type { MetadataRoute } from 'next'
import { isProductionDeployment, siteUrl } from '@/lib/site'

/**
 * Production: open to search engines AND named AI crawlers. Being explicit
 * about AI user agents documents intent (and is where you'd opt one out).
 * Everything else (previews, local): disallow all, so staging never leaks
 * into search results.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  const aiCrawlers = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'PerplexityBot',
    'Google-Extended',
    'Applebot-Extended',
  ]
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: aiCrawlers, allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
