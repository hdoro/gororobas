'use client'

import { addVegetable } from '@/actions/addVegetable'
import { createVegetableAction } from '@/actions/createVegetable.action'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Skipping SSR to prevent hydration errors on react-hook-form changing IDs
const VegetableForm = dynamic(() => import('@/components/VegetableForm'), {
	ssr: false,
})

export default function NewVegetableForm() {
	return (
		<>
			<Button onClick={() => addVegetable()}>Create TEST Vegetable</Button>
			<VegetableForm
				onSubmit={(vegetable) => createVegetableAction(vegetable)}
			/>
		</>
	)
}
