import { createClient } from '@sanity/client'

export const SANITY_BASE_CONFIG = {
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
	apiVersion: '2024-03-04',
	useCdn: process.env.NODE_ENV === 'production',
}

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
