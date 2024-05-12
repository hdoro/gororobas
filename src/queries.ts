import e, { type $infer } from '@/edgeql'

export const vegetablePageQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.Vegetable, (vegetable) => ({
      filter_single: e.op(vegetable.handle, '=', params.handle),

      names: true,
      scientific_names: true,
      handle: true,
      gender: true,
      strata: true,
      planting_methods: true,
      edible_parts: true,
      lifecycles: true,
      uses: true,
      origin: true,
      height_min: true,
      height_max: true,
      temperature_min: true,
      temperature_max: true,
      content: true,
      photos: {
        sanity_id: true,
        hotspot: true,
        crop: true,
        label: true,
        sourceType: true,
        source: true,
        credits: true,
        users: true,
      },
      varieties: {
        handle: true,
        names: true,
        photos: {
          sanity_id: true,
          hotspot: true,
          crop: true,
          label: true,
          sourceType: true,
          source: true,
          credits: true,
          users: true,
        },
      },
      tips: {
        handle: true,
        subjects: true,
        content: true,
        sourceType: true,
        source: true,
        credits: true,
        users: true,
      },
    })),
)

export type VegetablePageData = Exclude<$infer<typeof vegetablePageQuery>, null>
