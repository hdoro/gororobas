'use server'

import { auth } from '@/edgedb'
import type { VegetableForDB } from '@/schemas'
import type {
  PlantingMethod,
  VegetableEdiblePart,
  VegetableLifecycle,
  VegetableUsage,
} from '@/types'
import { generateId } from '@/utils/ids'
import { createVegetable } from './createVegetable'

export async function addVegetable(vegetableForDb?: VegetableForDB) {
  const session = auth.getSession()
  console.log(session.authToken)

  function getContent(): VegetableForDB {
    return (
      vegetableForDb || {
        gender: 'MASCULINO',
        names: [`Quiabo ${generateId()}`],
        handle: generateId(),
        scientific_names: ['Abelmoschus esculentus'],
        varieties: [
          {
            names: ['Variedade #1'],
            photos: [
              {
                label: 'Foto Variedade #1 - 1',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'EXTERNAL',
                credits: 'Créditos',
              },
              {
                label: 'Foto Variedade #1 - 2',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'GOROROBAS',
                userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
              },
            ],
            // order_index: 0,
          },
          {
            names: ['Variedade #2'],
            photos: [
              {
                label: 'Foto Variedade #2 - 1',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'EXTERNAL',
                credits: 'Créditos',
              },
              {
                label: 'Foto Variedade #2 - 2',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'GOROROBAS',
                userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
              },
            ],
            // order_index: 1,
          },
          {
            names: ['Variedade #3'],
            photos: [
              {
                label: 'Foto Variedade #3 - 1',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'EXTERNAL',
                credits: 'Créditos',
              },
              {
                label: 'Foto Variedade #3 - 2',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'GOROROBAS',
                userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
              },
            ],
            // order_index: 2,
          },
          {
            names: ['Variedade #4'],
            photos: [
              {
                label: 'Foto Variedade #4 - 1',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'EXTERNAL',
                credits: 'Créditos',
              },
              {
                label: 'Foto Variedade #4 - 2',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'GOROROBAS',
                userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
              },
            ],
            // order_index: 3,
          },
          {
            names: ['Variedade #5'],
            photos: [
              {
                label: 'Foto Variedade #5 - 1',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'EXTERNAL',
                credits: 'Créditos',
              },
              {
                label: 'Foto Variedade #5 - 2',
                data: {
                  base64: 'base64',
                  fileName: 'fileName',
                  mimeName: 'mimeName',
                },
                sourceType: 'GOROROBAS',
                userIds: ['437c5016-0d54-11ef-9b55-ff81ad9eb78e'],
              },
            ],
            // order_index: 4,
          },
        ],
        strata: ['ALTO'],
        height_max: 10,
        temperature_max: 30,
        height_min: 4,
        temperature_min: 20,
        edible_parts: ['FRUTO'] satisfies VegetableEdiblePart[],
        lifecycles: ['PERENE'] satisfies VegetableLifecycle[],
        planting_methods: ['SEMENTE'] satisfies PlantingMethod[],
        uses: ['ALIMENTO_HUMANO'] satisfies VegetableUsage[],
        origin: 'Continente africano',
        photos: [
          {
            label: 'Foto Raiz - 1',
            data: {
              base64: 'base64',
              fileName: 'fileName',
              mimeName: 'mimeName',
            },
            sourceType: 'EXTERNAL',
            credits: 'Créditos',
          },
          {
            label: 'Foto Raiz - 2',
            data: {
              base64: 'base64',
              fileName: 'fileName',
              mimeName: 'mimeName',
            },
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
    )
  }

  console.time('createVegetable')
  try {
    await createVegetable(getContent(), session.client)
    console.timeEnd('createVegetable')
    return true
  } catch (error) {
    console.timeEnd('createVegetable')
    console.log('ERROR', error)
    return false
  }
}
