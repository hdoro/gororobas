import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'

export const FILTER_DEFINITIONS = [
  {
    queryKey: 'nome',
    filterKey: 'search_query',
    type: 'search_query',
  },
  {
    queryKey: 'estrato',
    filterKey: 'strata',
    values: Object.keys(STRATUM_TO_LABEL),
    type: 'multiselect',
  },
  {
    queryKey: 'usos',
    filterKey: 'uses',
    values: Object.keys(USAGE_TO_LABEL),
    type: 'multiselect',
  },
  {
    queryKey: 'comestivel',
    filterKey: 'edible_parts',
    values: Object.keys(EDIBLE_PART_TO_LABEL),
    type: 'multiselect',
  },
  {
    queryKey: 'plantio',
    filterKey: 'planting_methods',
    values: Object.keys(PLANTING_METHOD_TO_LABEL),
    type: 'multiselect',
  },
  {
    queryKey: 'ciclo',
    filterKey: 'lifecycles',
    values: Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL),
    type: 'multiselect',
  },
  {
    queryKey: 'dias',
    filterKey: 'development_cycle',
    type: 'range',
  },
  {
    queryKey: 'altura',
    filterKey: 'height',
    type: 'range',
  },
  {
    queryKey: 'temperatura',
    filterKey: 'temperature',
    type: 'range',
  },
] as const
