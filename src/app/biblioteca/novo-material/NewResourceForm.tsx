'use client'

import dynamic from 'next/dynamic'
import { createResourceAction } from '@/actions/createResource.action'

// Skipping SSR to prevent hydration errors on react-hook-form changing IDs
const ResourceForm = dynamic(() => import('@/components/ResourceForm'), {
  ssr: false,
})

export default function NewResourceForm() {
  return (
    <ResourceForm onSubmit={(resource) => createResourceAction(resource)} />
  )
}
