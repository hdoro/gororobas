'use client'

import { addVegetable } from './addVegetable'

export default function AddToDBTest() {
  return <button onClick={() => addVegetable()}>Add item</button>
}
