'use server'

import { auth } from '@/gel'
import type { ResourceForDBWithImages } from '@/schemas'
import { createResource } from './createResource'

export async function createResourceAction(input: ResourceForDBWithImages) {
  const session = await auth.getSession()

  return createResource(input, session.client)
}
