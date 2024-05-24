'use client'

import { createEditSuggestionAction } from '@/actions/createEditSuggestion'
import type { VegetableForDB, VegetableInForm } from '@/schemas'
import { getChangedObjectSubset } from '@/utils/diffs'
import { paths } from '@/utils/urls'
import dynamic from 'next/dynamic'

// Skipping SSR to prevent hydration errors on react-hook-form changing IDs
const VegetableForm = dynamic(() => import('@/components/VegetableForm'), {
	ssr: false,
})

export default function EditVegetableForm(props: {
	vegetableForDB: VegetableForDB
	vegetableInForm: VegetableInForm
}) {
	return (
		<VegetableForm
			onSubmit={async (updatedVegetable) => {
				const dataThatChanged = getChangedObjectSubset({
					prev: props.vegetableForDB,
					next: updatedVegetable,
				})
				if (Object.keys(dataThatChanged).length === 0) {
					return {
						success: true,
						message: {
							title: 'Tudo certo, nada foi alterado',
							description: '',
						},
						redirectTo: paths.vegetable(props.vegetableForDB.handle),
					}
				}
				return await createEditSuggestionAction({
					current: props.vegetableForDB,
					updated: updatedVegetable,
				})
			}}
			initialValue={props.vegetableInForm}
		/>
	)
}
