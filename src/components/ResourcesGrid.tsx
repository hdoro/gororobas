'use client'

import ResourceCard from '@/components/ResourceCard'
import type { ResourceCardData } from '@/queries'
import { cn } from '@/utils/cn'

export function ResourcesGridWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string | undefined
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default function ResourcesGrid({
  resources,
  onResourceClick,
  className,
  emptyMessage = 'Nenhum recurso encontrado',
}: {
  resources: ResourceCardData[]
  onResourceClick?: ((resource: ResourceCardData) => void) | undefined
  className?: string | undefined
  emptyMessage?: string
}) {
  if (!resources.length) {
    return <div className="py-8 text-center text-stone-500">{emptyMessage}</div>
  }

  return (
    <ResourcesGridWrapper className={className}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onClick={onResourceClick}
        />
      ))}
    </ResourcesGridWrapper>
  )
}
