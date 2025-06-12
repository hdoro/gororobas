'use client'

import { createEditSuggestionAction } from '@/actions/createEditSuggestion'
import { m } from '@/paraglide/messages'
import type { VegetableForDBWithImages, VegetableInForm } from '@/schemas'
import { getChangedObjectSubset, removeNullishKeys } from '@/utils/diffs'
import { paths } from '@/utils/urls'
import dynamic from 'next/dynamic'

// Skipping SSR to prevent hydration errors on react-hook-form changing IDs
const VegetableForm = dynamic(() => import('@/components/VegetableForm'), {
  ssr: false,
})

export default function EditVegetableForm(props: {
  vegetableForDBWithImages: VegetableForDBWithImages
  vegetableInForm: VegetableInForm
}) {
  return (
    <VegetableForm
      onSubmit={async (updatedVegetable) => {
        const currentVegetable = removeNullishKeys(
          props.vegetableForDBWithImages,
        )
        const dataThatChanged = getChangedObjectSubset({
          prev: currentVegetable,
          next: updatedVegetable,
        })
        if (Object.keys(dataThatChanged).length === 0) {
          return {
            success: true,
            message: {
              title: m.aloof_acidic_dachshund_pout(),
            },
            redirectTo: paths.vegetable(props.vegetableForDBWithImages.handle),
          }
        }
        return await createEditSuggestionAction({
          current: currentVegetable,
          updated: updatedVegetable,
        })
      }}
      initialValue={props.vegetableInForm}
    />
  )
}
