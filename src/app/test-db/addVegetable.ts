'use server'

import { auth } from '@/edgedb'
import e from '@/edgeql'
import { generateId } from '@/utils/ids'

export async function addVegetable() {
  const session = auth.getSession()

  const handle = `quiabo-${generateId()}`

  const Varieties = [
    {
      names: ['Variedade #1'],
      handle: `${handle}-variedade-1-${generateId()}`,
    },
    {
      names: ['Variedade #2'],
      handle: `${handle}-variedade-2-${generateId()}`,
    },
    {
      names: ['Variedade #3'],
      handle: `${handle}-variedade-3-${generateId()}`,
    },
    {
      names: ['Variedade #4'],
      handle: `${handle}-variedade-4-${generateId()}`,
    },
    {
      names: ['Variedade #5'],
      handle: `${handle}-variedade-5-${generateId()}`,
      modify: '82a6e840-0d5a-11ef-addd-b3b07f0ea253',
    },
  ]
  const varietyInsertOps = Varieties.flatMap((variety) => {
    const insert = e.insert(e.VegetableVariety, {
      names: variety.names,
      handle: variety.handle,
    })
    return insert
  })
  const varietyModifyOps = Varieties.flatMap((variety) => {
    if (!variety.modify) return []

    return e.update(e.VegetableVariety, (v) => ({
      filter_single: e.op(v.id, '=', e.literal(e.uuid, variety.modify)),
      set: {
        names: [...variety.names, 'MODIFIED'],
        handle: 'blebleble',
      },
    }))
  })

  const newItemQuery = e.insert(e.Vegetable, {
    names: [`Quiabo ${generateId()}`],
    handle: handle,
    gender: 'MASCULINO',
    scientific_names: ['Abelmoschus esculentus'],
    stratum: ['ALTO'],
    varieties: e.set(...varietyInsertOps),
  })

  try {
    await session.client.transaction(async (tx) => {
      const addRes = await newItemQuery.run(tx)
      console.log({ addRes })

      const modifyRes = await Promise.all(
        varietyModifyOps.map((op) => op.run(tx)),
      )
      console.log({ modifyRes })
    })
  } catch (error) {
    console.log('ERROR', error)
  }
}
