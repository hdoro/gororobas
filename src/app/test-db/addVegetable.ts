'use server'

import { auth } from '@/edgedb'
import type { VegetableDecoded } from '@/schemas'
import type {
  PlantingMethod,
  VegetableEdiblePart,
  VegetableLifecycle,
  VegetableUsage,
} from '@/types'
import { generateId } from '@/utils/ids'
import { createVegetable } from './createVegetable'

export async function addVegetable() {
  const session = auth.getSession()
  console.log(session.authToken)

  function getContent(): VegetableDecoded {
    return {
      gender: 'MASCULINO',
      names: [{ value: `Quiabo ${generateId()}` }],
      handle: generateId(),
      scientific_names: [{ value: 'Abelmoschus esculentus' }],
      varieties: [
        {
          names: [{ value: 'Variedade #1' }],
          photos: [
            {
              label: 'Foto Variedade #1 - 1',
              photo: null as any,
              sourceType: 'EXTERNAL',
              credits: 'Créditos',
            },
            {
              label: 'Foto Variedade #1 - 2',
              photo: null as any,
              sourceType: 'GOROROBAS',
              userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
            },
          ],
          // order_index: 0,
        },
        {
          names: [{ value: 'Variedade #2' }],
          photos: [
            {
              label: 'Foto Variedade #2 - 1',
              photo: null as any,
              sourceType: 'EXTERNAL',
              credits: 'Créditos',
            },
            {
              label: 'Foto Variedade #2 - 2',
              photo: null as any,
              sourceType: 'GOROROBAS',
              userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
            },
          ],
          // order_index: 1,
        },
        {
          names: [{ value: 'Variedade #3' }],
          photos: [
            {
              label: 'Foto Variedade #3 - 1',
              photo: null as any,
              sourceType: 'EXTERNAL',
              credits: 'Créditos',
            },
            {
              label: 'Foto Variedade #3 - 2',
              photo: null as any,
              sourceType: 'GOROROBAS',
              userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
            },
          ],
          // order_index: 2,
        },
        {
          names: [{ value: 'Variedade #4' }],
          photos: [
            {
              label: 'Foto Variedade #4 - 1',
              photo: null as any,
              sourceType: 'EXTERNAL',
              credits: 'Créditos',
            },
            {
              label: 'Foto Variedade #4 - 2',
              photo: null as any,
              sourceType: 'GOROROBAS',
              userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
            },
          ],
          // order_index: 3,
        },
        {
          names: [{ value: 'Variedade #5' }],
          photos: [
            {
              label: 'Foto Variedade #5 - 1',
              photo: null as any,
              sourceType: 'EXTERNAL',
              credits: 'Créditos',
            },
            {
              label: 'Foto Variedade #5 - 2',
              photo: null as any,
              sourceType: 'GOROROBAS',
              userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
            },
          ],
          // order_index: 4,
        },
      ],
      stratum: ['ALTO'],
      height_max: 10,
      temperature_max: 30,
      height_min: 4,
      temperature_min: 20,
      edible_parts: ['FRUTO'] satisfies VegetableEdiblePart[],
      lifecycle: ['PERENE'] satisfies VegetableLifecycle[],
      planting_methods: ['SEMENTE'] satisfies PlantingMethod[],
      uses: ['ALIMENTO_HUMANO'] satisfies VegetableUsage[],
      origin: 'Continente africano',
      photos: [
        {
          label: 'Foto Raiz - 1',
          photo: null as any,
          sourceType: 'EXTERNAL',
          credits: 'Créditos',
        },
        {
          label: 'Foto Raiz - 2',
          photo: null as any,
          sourceType: 'GOROROBAS',
          userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
        },
      ],
      content: { content: true } as any,
      tips: [
        {
          subjects: ['COLHEITA'],
          content: { content: true } as any,
          sourceType: 'EXTERNAL',
          credits: 'Créditos',
        },
        {
          subjects: ['CRESCIMENTO'],
          content: { content: true } as any,
          sourceType: 'GOROROBAS',
          userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
        },
      ],
    }
  }

  console.time('createVegetable')
  try {
    await createVegetable(getContent(), session.client)
  } catch (error) {
    console.log('ERROR', error)
  }
  console.timeEnd('createVegetable')
}
