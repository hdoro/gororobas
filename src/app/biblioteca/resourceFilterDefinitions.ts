import type { ReferenceObjectType } from '@/types'
import { RESOURCE_FORMAT_TO_LABEL } from '@/utils/labels'
import type { LucideProps } from 'lucide-react'
import { CarrotIcon, SearchIcon, ShapesIcon, TagsIcon } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

export type ResourceFilterDefinition = {
  queryKey: string
  filterKey: string
  label: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
} & (
  | {
      type: 'search_query'
    }
  | {
      type: 'multiselect'
      valueLabels: Record<string, string>
      values: string[]
    }
  | {
      type: 'reference'
      objectType: ReferenceObjectType
    }
)

export const FILTER_DEFINITIONS = [
  {
    queryKey: 'titulo',
    filterKey: 'search_query',
    label: 'Buscar por título',
    type: 'search_query',
    icon: SearchIcon,
  },
  {
    queryKey: 'formato',
    filterKey: 'formats',
    label: 'Formato',
    type: 'multiselect',
    values: Object.keys(RESOURCE_FORMAT_TO_LABEL),
    valueLabels: RESOURCE_FORMAT_TO_LABEL,
    icon: ShapesIcon,
  },
  {
    queryKey: 'etiquetas',
    filterKey: 'tags',
    label: 'Etiquetas',
    type: 'reference',
    objectType: 'Tag',
    icon: TagsIcon,
  },
  {
    queryKey: 'vegetais',
    filterKey: 'vegetables',
    label: 'Vegetais',
    type: 'reference',
    objectType: 'Vegetable',
    icon: CarrotIcon,
  },
] as const satisfies ResourceFilterDefinition[]
