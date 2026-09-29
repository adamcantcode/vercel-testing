import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next'
import * as flags from '@/lib/experiments/flags'

/**
 * Flags Explorer discovery endpoint. The Vercel Toolbar (on preview
 * deployments) reads this to list every flag and its options, and lets you
 * override your own assignment, so QA can check both variants of a test
 * without clearing cookies. Access is gated by FLAGS_SECRET.
 */
export const GET = createFlagsDiscoveryEndpoint(() => getProviderData(flags))
