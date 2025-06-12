import { m } from '@/paraglide/messages'
import type { ReferenceObjectType } from '@/types'
import { RESOURCE_FORMAT_TO_LABEL } from '@/utils/labels'
import type { LucideIcon } from 'lucide-react'
import { CarrotIcon, SearchIcon, ShapesIcon, TagsIcon } from 'lucide-react'

export type ResourceFilterDefinition = {
  queryKey: string
  filterKey: string
  label: string
  icon: LucideIcon
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
    get label() {
      return m.mealy_tough_oryx_read()
    },
    type: 'search_query',
    icon: SearchIcon,
  },
  {
    queryKey: 'formato',
    filterKey: 'formats',
    get label() {
      return m.main_equal_swallow_clasp()
    },
    type: 'multiselect',
    values: Object.keys(RESOURCE_FORMAT_TO_LABEL),
    valueLabels: RESOURCE_FORMAT_TO_LABEL,
    icon: ShapesIcon,
  },
  {
    queryKey: 'etiquetas',
    filterKey: 'tags',
    get label() {
      return m.gaudy_caring_hare_arise()
    },
    type: 'reference',
    objectType: 'Tag',
    icon: TagsIcon,
  },
  {
    queryKey: 'vegetais',
    filterKey: 'vegetables',
    get label() {
      return m.proof_major_ant_trim()
    },
    type: 'reference',
    objectType: 'Vegetable',
    icon: CarrotIcon,
  },
] as const satisfies ResourceFilterDefinition[]
