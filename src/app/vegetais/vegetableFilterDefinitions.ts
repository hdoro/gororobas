import type SliderRangeInput from '@/components/forms/SliderRangeInput'
import {
  MAX_ACCEPTED_DEVELOPMENT_CYCLE_DAYS,
  MAX_ACCEPTED_TEMPERATURE,
  MIN_ACCEPTED_DEVELOPMENT_CYCLE_DAYS,
  MIN_ACCEPTED_TEMPERATURE,
} from '@/schemas'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { MAX_ACCEPTED_HEIGHT, type NumberFormat } from '@/utils/numbers'
import {
  ArrowUpNarrowWide,
  BeanIcon,
  CalendarClockIcon,
  CookingPotIcon,
  type LucideIcon,
  RecycleIcon,
  RulerIcon,
  SearchIcon,
  ShapesIcon,
  ThermometerIcon,
} from 'lucide-react'
import type { ComponentProps } from 'react'

export type FilterDefinition = {
  queryKey: string
  filterKey: string
  label: string
  icon: LucideIcon
} & (
  | {
      type: 'search_query'
    }
  | ({ type: 'range'; format: NumberFormat } & Omit<
      ComponentProps<typeof SliderRangeInput>,
      'field'
    >)
  | {
      type: 'multiselect'
      valueLabels: Record<string, string>
      values: string[]
    }
)

export const FILTER_DEFINITIONS = [
  {
    queryKey: 'nome',
    filterKey: 'search_query',
    label: 'Buscar por nome',
    type: 'search_query',
    icon: SearchIcon,
  },
  {
    queryKey: 'estrato',
    filterKey: 'strata',
    label: 'Estrato',
    type: 'multiselect',
    values: Object.keys(STRATUM_TO_LABEL),
    valueLabels: STRATUM_TO_LABEL,
    icon: ArrowUpNarrowWide,
  },
  {
    queryKey: 'usos',
    filterKey: 'uses',
    label: 'Principais usos',
    type: 'multiselect',
    values: Object.keys(USAGE_TO_LABEL),
    valueLabels: USAGE_TO_LABEL,
    icon: ShapesIcon,
  },
  {
    queryKey: 'comestivel',
    filterKey: 'edible_parts',
    label: 'Partes comestíveis',
    type: 'multiselect',
    values: Object.keys(EDIBLE_PART_TO_LABEL),
    valueLabels: EDIBLE_PART_TO_LABEL,
    icon: CookingPotIcon,
  },
  {
    queryKey: 'plantio',
    filterKey: 'planting_methods',
    label: 'Plantio por',
    type: 'multiselect',
    values: Object.keys(PLANTING_METHOD_TO_LABEL),
    valueLabels: PLANTING_METHOD_TO_LABEL,
    icon: BeanIcon,
  },
  {
    queryKey: 'ciclo',
    filterKey: 'lifecycles',
    label: 'Ciclo de vida',
    type: 'multiselect',
    values: Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL),
    valueLabels: VEGETABLE_LIFECYCLE_TO_LABEL,
    icon: RecycleIcon,
  },
  {
    queryKey: 'dias',
    filterKey: 'development_cycle',
    label: 'Tempo até produzir',
    type: 'range',
    format: 'days',
    icon: CalendarClockIcon,
    min: MIN_ACCEPTED_DEVELOPMENT_CYCLE_DAYS,
    max: MAX_ACCEPTED_DEVELOPMENT_CYCLE_DAYS,
    step: 10,
  },
  {
    queryKey: 'altura',
    filterKey: 'height',
    label: 'Altura',
    type: 'range',
    format: 'centimeters',
    icon: RulerIcon,
    min: 0,
    max: MAX_ACCEPTED_HEIGHT,
    step: 20,
  },
  {
    queryKey: 'temperatura',
    filterKey: 'temperature',
    label: 'Temperatura',
    type: 'range',
    format: 'temperature',
    icon: ThermometerIcon,
    min: MIN_ACCEPTED_TEMPERATURE,
    max: MAX_ACCEPTED_TEMPERATURE,
    step: 2.5,
  },
] as const satisfies FilterDefinition[]
