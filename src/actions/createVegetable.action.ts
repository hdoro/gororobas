'use server'

import { auth } from '@/gel'
import type { VegetableForDBWithImages } from '@/schemas'
import { createVegetable } from './createVegetable'

export async function createVegetableAction(input: VegetableForDBWithImages) {
  const session = await auth.getSession()

  return createVegetable(input, session.client)
}
