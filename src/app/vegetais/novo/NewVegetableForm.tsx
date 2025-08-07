'use client'

import dynamic from 'next/dynamic'
import { createVegetableAction } from '@/actions/createVegetable.action'

// Skipping SSR to prevent hydration errors on react-hook-form changing IDs
const VegetableForm = dynamic(() => import('@/components/VegetableForm'), {
  ssr: false,
})

export default function NewVegetableForm() {
  return (
    <VegetableForm onSubmit={(vegetable) => createVegetableAction(vegetable)} />
  )
}
