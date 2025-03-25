import { RESOURCE_FORMAT_TO_LABEL } from '@/utils/labels'
import type { LucideProps } from 'lucide-react'
import { SearchIcon, ShapesIcon } from 'lucide-react'
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
)

// @TODO dynamic filters for tags & vegetables - leverage what we have in ReferenceInput
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
  // {
  //   queryKey: 'etiquetas',
  //   filterKey: 'tags',
  //   type: 'multiselect',
  //   options: [] as { value: string; label: string }[],
  //   // Tags will be populated from the API
  // },
  // {
  //   id: 'vegetables',
  //   label: 'Vegetais',
  //   filterKey: 'vegetables',
  //   type: 'multiselect',
  //   options: [] as { value: string; label: string }[],
  //   // Vegetables will be populated from the API
  // },
] as const satisfies ResourceFilterDefinition[]
