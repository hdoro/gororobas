'use server'

import { auth } from '@/edgedb'
import e from '@/edgeql'

export async function addVegetable() {
  const session = auth.getSession()

  const newItemQuery = e.insert(e.Vegetable, {
    names: ['Quiabo'],
    handle: 'quiabo',
    gender: 'FEMININO',
    scientific_names: ['Abelmoschus esculentus'],
    stratum: ['ALTO'],
  })

  try {
    const res = await newItemQuery.run(session.client)
    console.log(res)
  } catch (error) {
    console.log('ERROR', error)
  }
}
