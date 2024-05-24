'use client'

import { createVegetableAction } from '@/actions/createVegetable.action'
import VegetableForm from '@/components/VegetableForm'

export default function NewVegetableForm() {
	return (
		<VegetableForm onSubmit={(vegetable) => createVegetableAction(vegetable)} />
	)
}
