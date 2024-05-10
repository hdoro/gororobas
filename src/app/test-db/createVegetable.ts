import e from '@/edgeql'
import { stringArrayTransformer, type VegetableDecoded } from '@/schemas'
import { generateId } from '@/utils/ids'
import { slugify } from '@/utils/strings'
import * as S from '@effect/schema/Schema'
import type { Client } from 'edgedb'

const newPhotosMutation = e.params(
  {
    photos: e.array(
      e.tuple({
        id: e.uuid,
        sanity_id: e.str,
        label: e.str,
        /** @see {PhotoInputValue['source']} */
        optional_properties: e.json,
      }),
    ),
  },
  (params) =>
    e.for(e.array_unpack(params.photos), (photo) =>
      e.insert(e.Photo, {
        id: photo.id,
        sanity_id: photo.sanity_id,
        label: photo.label,
        credits: e.cast(
          e.str,
          e.json_get(photo.optional_properties, 'credits'),
        ),
        sourceType: e.cast(
          e.SourceType,
          e.json_get(photo.optional_properties, 'sourceType'),
        ),
        source: e.cast(
          e.str,
          e.json_get(photo.optional_properties, 'sourceType'),
        ),
        users: e.select(e.User, (user) => ({
          filter: e.op(
            user.id,
            'in',
            e.array_unpack(
              e.cast(
                e.array(e.uuid),
                e.json_get(photo.optional_properties, 'userIds'),
              ),
            ),
          ),
        })),
      }),
    ),
)

const newVarietiesMutation = e.params(
  {
    varieties: e.array(
      e.tuple({
        id: e.uuid,
        names: e.array(e.str),
        handle: e.str,
        photos: e.array(e.uuid),
      }),
    ),
  },
  (params) =>
    e.for(e.array_unpack(params.varieties), (variety) =>
      e.insert(e.VegetableVariety, {
        id: variety.id,
        names: variety.names,
        handle: variety.handle,
        photos: e.select(e.Photo, (photo) => ({
          filter: e.op(photo.id, 'in', e.array_unpack(variety.photos)),
        })),
      }),
    ),
)

const newVegetableMutation = e.params(
  {
    names: e.array(e.str),
    scientific_names: e.array(e.str),
    handle: e.str,
    gender: e.Gender,
    origin: e.optional(e.str),
    stratum: e.array(e.str),
    uses: e.optional(e.array(e.str)),
    edible_parts: e.optional(e.array(e.str)),
    lifecycle: e.optional(e.array(e.str)),
    planting_methods: e.optional(e.array(e.str)),
    height_min: e.optional(e.float32),
    height_max: e.optional(e.float32),
    temperature_min: e.optional(e.float32),
    temperature_max: e.optional(e.float32),
    content: e.optional(e.json),

    // Refs
    photos: e.optional(e.array(e.uuid)),
    varieties: e.optional(e.array(e.uuid)),
    tips: e.optional(e.array(e.uuid)),
  },
  (params) =>
    e.insert(e.Vegetable, {
      ...params,
      stratum: e.cast(e.array(e.Stratum), params.stratum),
      uses: e.cast(e.array(e.VegetableUsage), params.uses),
      edible_parts: e.cast(e.array(e.EdiblePart), params.edible_parts),
      lifecycle: e.cast(e.array(e.VegetableLifeCycle), params.lifecycle),
      planting_methods: e.cast(
        e.array(e.PlantingMethod),
        params.planting_methods,
      ),
      photos: e.select(e.Photo, (photo) => ({
        filter: e.op(photo.id, 'in', e.array_unpack(params.photos)),
      })),
      varieties: e.select(e.VegetableVariety, (variety) => ({
        filter: e.op(variety.id, 'in', e.array_unpack(params.varieties)),
      })),
      tips: e.select(e.VegetableTip, (tip) => ({
        filter: e.op(tip.id, 'in', e.array_unpack(params.tips)),
      })),
    }),
)

export async function createVegetable(
  input: VegetableDecoded,
  inputClient: Client,
) {
  const client = inputClient.withConfig({ allow_user_specified_id: true })

  return client.transaction(async (tx) => {
    // #1 CREATE ALL PHOTOS
    const allPhotos = [
      ...(input.varieties || []).flatMap((v) => v?.photos || []),
      ...(input.photos || []),
    ].map(({ label, photo, ...optional_properties }) => {
      return {
        id: generateId(),
        sanity_id: generateId(),
        label: label,
        optional_properties: {
          // userIds: [], // Default empty array for userIds to prevent type errors in EdgeDB
          ...optional_properties,
        },
      }
    })

    if (allPhotos.length > 0) {
      await newPhotosMutation.run(tx, {
        photos: allPhotos,
      })
    }

    // #2 CREATE ALL VARIETIES
    const varieties = (input.varieties || []).map((v) => {
      return {
        id: generateId(),
        names: v.names.map((name) =>
          S.decodeSync(stringArrayTransformer)(name),
        ),
        handle: `${input.handle}-${slugify(v.names[0].value)}`,
        photos: (v.photos || []).flatMap((photo) => {
          // @TODO: better way to lock IDs, probably when decoding the input
          const photoId = allPhotos.find((p) => p.label === photo.label)?.id
          if (!photoId) return []

          return photoId
        }),
      }
    })

    if (varieties.length > 0) {
      await newVarietiesMutation.run(tx, {
        varieties,
      })
    }

    // #3 Create all tips

    // #4 Create vegetable
    await newVegetableMutation.run(tx, {
      gender: input.gender,
      handle: input.handle,
      stratum: input.stratum,
      temperature_max: input.temperature_max || null,
      temperature_min: input.temperature_min || null,
      height_max: input.height_max || null,
      height_min: input.height_min || null,
      origin: input.origin || null,
      uses: input.uses || null,
      planting_methods: input.planting_methods || null,
      edible_parts: input.edible_parts || null,
      lifecycle: input.lifecycle || null,
      content: input.content || null,
      names: input.names.map((name) =>
        S.decodeSync(stringArrayTransformer)(name),
      ),
      scientific_names: input.scientific_names.map((name) =>
        S.decodeSync(stringArrayTransformer)(name),
      ),
      photos: (input.photos || []).flatMap((photo) => {
        // @TODO: better way to lock IDs, probably when decoding the input
        const photoId = allPhotos.find((p) => p.label === photo.label)?.id
        if (!photoId) return []

        return photoId
      }),
      varieties: (input.varieties || []).flatMap((variety) => {
        // @TODO: better way to lock IDs, probably when decoding the input
        const id = varieties.find(
          (v) => v.names[0] === variety.names[0].value,
        )?.id
        if (!id) return []

        return id
      }),
    })
  })
}
