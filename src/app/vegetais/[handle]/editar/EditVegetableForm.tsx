'use client'

import { createVegetableAction } from '@/actions/createVegetable.action'
import VegetableForm from '@/components/VegetableForm'
import type { VegetableInForm } from '@/schemas'

export default function EditVegetableForm(props: {
	vegetable: VegetableInForm
}) {
	return (
		<VegetableForm
			onSubmit={(vegetable) => createVegetableAction(vegetable)}
			initialValue={props.vegetable}
		/>
	)
}
