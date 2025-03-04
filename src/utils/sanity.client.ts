import { createClient } from '@sanity/client'
import { SANITY_BASE_CONFIG } from './config'

/**
 * Simple base client
 */
export const sanityClient = createClient(SANITY_BASE_CONFIG)

export const sanityServerClient = createClient({
  ...SANITY_BASE_CONFIG,
  token: process.env.SANITY_WRITE_TOKEN as string,
  perspective: 'published',
})

/** To be used in mutations */
export const sanityServerClientRaw = createClient({
  ...SANITY_BASE_CONFIG,
  token: process.env.SANITY_WRITE_TOKEN as string,
  perspective: 'raw',
})
