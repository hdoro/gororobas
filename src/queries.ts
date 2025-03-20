import e, { type $infer } from '@/edgeql'
import type {
  EdiblePart,
  NoteType,
  PlantingMethod,
  Stratum,
  VegetableLifeCycle,
  VegetableUsage,
} from './edgedb.interfaces'
import { NOTES_PER_PAGE, VEGETABLES_PER_PAGE } from './utils/config'

const sourceForCard = e.shape(e.Source, () => ({
  id: true,
  type: true,
  origin: true,
  credits: true,
  comments: true,
  users: {
    id: true,
    name: true,
    handle: true,
    photo: {
      sanity_id: true,
      hotspot: true,
      crop: true,
    },
    location: true,
  },
}))

export type SourceCardData = Exclude<$infer<typeof sourceForCard>, null>[number]

const imageForRendering = e.shape(e.Image, () => ({
  id: true,
  sanity_id: true,
  hotspot: true,
  crop: true,
  label: true,
  sources: sourceForCard,
}))

export type ImageForRenderingData = Exclude<
  $infer<typeof imageForRendering>,
  null
>[number]

const vegetableForCard = e.shape(e.Vegetable, (vegetable) => ({
  id: true,
  handle: true,
  name: vegetable.names.index(0),
  photos: (image) => ({
    ...imageForRendering(image),

    limit: 1,
    order_by: {
      expression: image['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
  varieties: (variety) => ({
    photos: (image) => ({
      ...imageForRendering(image),

      limit: 1,
      order_by: {
        expression: image['@order_index'],
        direction: 'ASC',
        empty: e.EMPTY_LAST,
      },
    }),

    order_by: {
      expression: variety['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
}))

type VegetableCardDataRaw = Exclude<
  $infer<typeof vegetableForCard>,
  null
>[number]

export type VegetableCardData = Omit<VegetableCardDataRaw, 'varieties'> & {
  // Some instances of vegetables' cards won't have varieties
  varieties?: VegetableCardDataRaw['varieties']
}

const userProfileForAvatar = e.shape(e.UserProfile, () => ({
  name: true,
  handle: true,
  photo: (image) => ({ ...imageForRendering(image), sources: false }),
  location: true,
}))

/** Returns only public notes, by default */
const noteForCard = e.shape(e.Note, (note) => ({
  title: true,
  body: true,
  handle: true,
  published_at: true,
  types: true,
  created_by: (userProfile) => ({
    ...userProfileForAvatar(userProfile),
    location: false,
  }),

  filter: e.op(note.public, '=', true),
}))

type NoteForCardResult = Exclude<$infer<typeof noteForCard>, null>[number]
export type NoteCardData = Omit<
  NoteForCardResult,
  'published_at' | 'created_by'
> & {
  /** When sending over the wire via API routes, the Date gets serialized to an ISOString */
  published_at: Date | string
  /** In UserProfilePage (userProfilePageQuery), created_by isn't fetched */
  created_by?: NoteForCardResult['created_by']
}

const vegetableVarietyForCard = e.shape(e.VegetableVariety, (variety) => ({
  handle: true,
  names: true,
  photos: (image) => ({
    ...imageForRendering(image),

    order_by: {
      expression: image['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
}))

export type VegetableVarietyCardData = Exclude<
  $infer<typeof vegetableVarietyForCard>,
  null
>[number]

const vegetableTipForCard = e.shape(e.VegetableTip, (tip) => ({
  id: true,
  handle: true,
  subjects: true,
  content: true,
  sources: (source) => ({
    ...sourceForCard(source),

    order_by: {
      expression: source['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
}))

export type VegetableTipCardData = Exclude<
  $infer<typeof vegetableTipForCard>,
  null
>[number]

const coreVegetableData = e.shape(e.Vegetable, () => ({
  id: true,
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
  development_cycle_min: true,
  development_cycle_max: true,
  height_min: true,
  height_max: true,
  temperature_min: true,
  temperature_max: true,
  content: true,
}))

const vegetablePageShape = e.shape(e.Vegetable, (vegetable) => ({
  ...coreVegetableData(vegetable),
  current_user_id: e.global.current_user_profile.id,
  current_user_role: e.global.current_user.userRole,
  photos: (image) => ({
    ...imageForRendering(image),

    order_by: {
      expression: image['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
  varieties: (variety) => ({
    ...vegetableVarietyForCard(variety),

    order_by: {
      expression: variety['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
  tips: (tip) => ({
    ...vegetableTipForCard(tip),

    order_by: {
      expression: tip['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
  friends: vegetableForCard,
  sources: sourceForCard,
  related_notes: (note) => ({
    ...noteForCard(note),
    filter: e.op(
      e.op('exists', (e.global.current_user_profile)), // Check if user is signed in. Será que vale usar isso em todas?
      'or',
      e.op(note.publish_status, '=', 'PUBLIC'),
    ),

    limit: 12,
  }),
}))

export const vegetablePageQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.Vegetable, (vegetable) => ({
      filter_single: e.op(vegetable.handle, '=', params.handle),

      ...vegetablePageShape(vegetable),
    })),
)

export type VegetablePageData = Exclude<$infer<typeof vegetablePageQuery>, null>

const vegetableEditingShape = e.shape(e.Vegetable, (vegetable) => ({
  ...coreVegetableData(vegetable),
  photos: (image) => ({
    ...imageForRendering(image),

    order_by: {
      expression: image['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
  varieties: (variety) => ({
    ...vegetableVarietyForCard(variety),
    id: true,

    order_by: {
      expression: variety['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
  tips: (tip) => ({
    ...vegetableTipForCard(tip),
    id: true,

    order_by: {
      expression: tip['@order_index'],
      direction: 'ASC',
      empty: e.EMPTY_LAST,
    },
  }),
  friends: {
    id: true,
  },
  sources: sourceForCard,
}))

export type VegetableEditingData = Exclude<
  $infer<typeof vegetableEditingShape>,
  null
>[number]

export const vegetableEditingQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.Vegetable, (vegetable) => ({
      filter_single: e.op(vegetable.handle, '=', params.handle),
      ...vegetableEditingShape(vegetable),
    })),
)

export const editSuggestionPreviewQuery = e.params(
  {
    suggestion_id: e.uuid,
  },
  (params) =>
    e.select(e.EditSuggestion, (suggestion) => ({
      filter_single: e.op(suggestion.id, '=', params.suggestion_id),

      id: true,
      diff: true,
      status: true,
      created_at: true,
      created_by: (userProfile) => ({
        ...userProfileForAvatar(userProfile),
      }),
      target_object: (vegetable) => ({
        ...vegetableEditingShape(vegetable),
      }),
      can_approve: e.op(e.global.current_user.userRole, '!=', e.Role.USER),
    })),
)

export const vegetableCardsByIdQuery = e.params(
  {
    vegetable_ids: e.array(e.uuid),
  },
  (params) =>
    e.select(e.Vegetable, (vegetable) => ({
      filter: e.op(vegetable.id, 'in', e.array_unpack(params.vegetable_ids)),

      ...vegetableForCard(vegetable),
    })),
)

export const wishlistedByQuery = e.params({ vegetable_id: e.uuid }, (params) =>
  e.select(e.Vegetable, (vegetable) => ({
    filter_single: e.op(vegetable.id, '=', params.vegetable_id),

    wishlisted_by: {
      status: true,
      user_profile: userProfileForAvatar,

      limit: 20,
    },
  })),
)

export type WishlistedByData = Exclude<$infer<typeof wishlistedByQuery>, null>

export const findUsersToMentionQuery = e.params(
  {
    query: e.str,
  },
  (params) =>
    e.select(e.UserProfile, (user) => ({
      filter: e.op(user.name, 'ilike', params.query),

      id: true,
      ...userProfileForAvatar(user),
    })),
)

export type UsersToMentionData = Exclude<
  $infer<typeof findUsersToMentionQuery>,
  null
>

export const userWishlistQuery = e.params(
  {
    vegetable_id: e.uuid,
  },
  (params) =>
    e.select(e.UserWishlist, (wishlist) => ({
      status: true,

      filter_single: e.op(
        e.op(wishlist.user_profile, '=', e.global.current_user_profile),
        'and',
        e.op(
          wishlist.vegetable,
          '=',
          e.select(e.Vegetable, (vegetable) => ({
            filter_single: e.op(vegetable.id, '=', params.vegetable_id),
          })),
        ),
      ),
    })),
)

export const vegetablesForReferenceQuery = e.select(
  e.Vegetable,
  (vegetable) => ({
    id: true,
    label: vegetable.names.index(0),
    photos: (image) => ({
      ...imageForRendering(image),

      limit: 1,
      order_by: {
        expression: image['@order_index'],
        direction: 'ASC',
        empty: e.EMPTY_LAST,
      },
    }),
  }),
)

export const profilesForReferenceQuery = e.select(e.UserProfile, (profile) => ({
  id: true,
  label: profile.name,
  photo: imageForRendering,
}))

export const editProfileQuery = e.select(e.UserProfile, (profile) => ({
  filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),

  name: true,
  id: true,
  handle: true,
  location: true,
  bio: true,
  photo: imageForRendering,
}))

export type EditProfilePageData = Exclude<$infer<typeof editProfileQuery>, null>

export const profileForNavQuery = e.select(e.UserProfile, (profile) => ({
  filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),

  handle: true,
  photo: imageForRendering,
}))

export const notePageQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.Note, (note) => ({
      ...noteForCard(note),
      id: true,
      created_by: (userProfile) => ({
        ...userProfileForAvatar(userProfile),
        bio: true,
      }),
      is_owner: e.op(note.created_by, '=', e.global.current_user_profile),

      filter_single: e.op(note.handle, '=', params.handle),

      related_notes: (note) => ({
        ...noteForCard(note),
        filter: e.op(
            e.op('exists', (e.global.current_user_profile)),
            'or',
            e.op(note.publish_status, '=', 'PUBLIC'),
          ),

        limit: 12,
      }),
      related_to_vegetables: vegetableForCard,
    })),
)

export type NotePageData = Exclude<$infer<typeof notePageQuery>, null>

export const noteEditingQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.Note, (note) => ({
      filter_single: e.op(note.handle, '=', params.handle),

      ...e.Note['*'],
    })),
)

export const currentUserQuery = e.select(e.UserProfile, (profile) => ({
  filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),
}))

/** EdgeDB's float32 max value */
const MAX_FLOAT = 3.4e38
const MIN_FLOAT = MAX_FLOAT * -1

export const vegetablesIndexQuery = e.params(
  {
    strata: e.optional(e.array(e.str)),
    planting_methods: e.optional(e.array(e.str)),
    edible_parts: e.optional(e.array(e.str)),
    lifecycles: e.optional(e.array(e.str)),
    uses: e.optional(e.array(e.str)),
    search_query: e.str,
    offset: e.int32,
    height_min: e.optional(e.float32),
    height_max: e.optional(e.float32),
    temperature_min: e.optional(e.float32),
    temperature_max: e.optional(e.float32),
    development_cycle_min: e.optional(e.int16),
    development_cycle_max: e.optional(e.int16),
  },
  (params) =>
    e.select(e.Vegetable, (vegetable) => {
      const multiselectFilters = [
        {
          vegetableValue: vegetable.strata,
          paramValue: params.strata,
          type: e.Stratum,
        },
        {
          vegetableValue: vegetable.planting_methods,
          paramValue: params.planting_methods,
          type: e.PlantingMethod,
        },
        {
          vegetableValue: vegetable.edible_parts,
          paramValue: params.edible_parts,
          type: e.EdiblePart,
        },
        {
          vegetableValue: vegetable.lifecycles,
          paramValue: params.lifecycles,
          type: e.VegetableLifeCycle,
        },
        {
          vegetableValue: vegetable.uses,
          paramValue: params.uses,
          type: e.VegetableUsage,
        },
      ] as const

      const numberFilters = [
        {
          vegetableValue: vegetable.height_min,
          paramValue: params.height_min,
          type: 'min',
        },
        {
          vegetableValue: vegetable.height_max,
          paramValue: params.height_max,
          type: 'max',
        },
        {
          vegetableValue: vegetable.temperature_min,
          paramValue: params.temperature_min,
          type: 'min',
        },
        {
          vegetableValue: vegetable.temperature_max,
          paramValue: params.temperature_max,
          type: 'max',
        },
        {
          vegetableValue: vegetable.development_cycle_min,
          paramValue: params.development_cycle_min,
          type: 'min',
        },
        {
          vegetableValue: vegetable.development_cycle_max,
          paramValue: params.development_cycle_max,
          type: 'max',
        },
      ] as const

      const filterOps = [
        e.op(
          // Either there's no search query
          e.op(e.len(params.search_query), '=', 0),
          'or',
          // Or the vegetable matches it
          e.ext.pg_trgm.word_similar(
            params.search_query,
            vegetable.searchable_names,
          ),
        ),

        ...numberFilters.map(({ vegetableValue, paramValue, type }) => {
          if (type === 'min') {
            return e.op(
              e.op(vegetableValue, '??', e.cast(e.float32, 0)),
              '>=',
              e.op(paramValue, '??', e.cast(e.float32, MIN_FLOAT)),
            )
          }

          // max
          return e.op(
            e.op(vegetableValue, '??', e.cast(e.float32, 0)),
            '<=',
            e.op(paramValue, '??', e.cast(e.float32, MAX_FLOAT)),
          )
        }),

        ...multiselectFilters.map(({ vegetableValue, paramValue, type }) =>
          e.op(
            // Either the param doesn't exist
            e.op('not', e.op('exists', paramValue)),
            'or',
            // Or the vegetable has at least one of the values
            e.op(
              e.count(
                e.op(
                  vegetableValue,
                  'intersect',
                  e.array_unpack(e.cast(e.array(type), paramValue)),
                ),
              ),
              '>',
              0,
            ),
          ),
        ),
      ]

      const finalFilter = filterOps.reduce((finalFilter, op) => {
        if (finalFilter === null) return op
        return e.op(finalFilter, 'and', op)
      })

      return {
        ...vegetableForCard(vegetable),
        uses: true,
        strata: true,
        planting_methods: true,
        edible_parts: true,
        lifecycles: true,

        filter: finalFilter,

        limit: VEGETABLES_PER_PAGE,
        offset: params.offset,
        order_by: [
          {
            expression: e.count(vegetable.photos),
            direction: e.DESC,
            empty: e.EMPTY_LAST,
          },
          {
            expression: vegetable.handle,
            direction: e.ASC,
          },
        ],
      }
    }),
)

export type VegetablesIndexData = Exclude<
  $infer<typeof vegetablesIndexQuery>,
  null
>

export type VegetablesIndexQueryParams = Pick<
  Parameters<typeof vegetablesIndexQuery.run>[1],
  'offset'
> & {
  strata?: Stratum[] | null
  planting_methods?: PlantingMethod[] | null
  edible_parts?: EdiblePart[] | null
  lifecycles?: VegetableLifeCycle[] | null
  uses?: VegetableUsage[] | null
  search_query?: string | null
  temperature_min?: number | null
  temperature_max?: number | null
  height_min?: number | null
  height_max?: number | null
  development_cycle_min?: number | null
  development_cycle_max?: number | null
}

export type VegetablesIndexFilterParams = Omit<
  VegetablesIndexQueryParams,
  'offset'
>

export const notesIndexQuery = e.params(
  {
    types: e.optional(e.array(e.str)),
    offset: e.int32,
    // isSignedIn: e.bool,
  },
  (params) =>
    e.select(e.Note, (note) => {
      return {
        ...noteForCard(note),

        filter: e.op(
          e.op(
            e.op('exists', (e.global.current_user_profile)),
            'or',
            e.op(note.publish_status, '=', 'PUBLIC'),
          ),
          'and',
          e.op(
            // Either the param doesn't exist
            e.op('not', e.op('exists', params.types)),
            'or',
            // Or the note has at least one of the type values
            e.op(
              e.count(
                e.op(
                  note.types,
                  'intersect',
                  e.array_unpack(e.cast(e.array(e.NoteType), params.types)),
                ),
              ),
              '>',
              0,
            ),
          ),
        ),

        limit: NOTES_PER_PAGE,
        offset: params.offset,
        order_by: {
          expression: note.published_at,
          direction: e.DESC,
          empty: e.EMPTY_LAST,
        },
      }
    }),
)

export type NotesIndexData = Exclude<$infer<typeof notesIndexQuery>, null>

export type NotesIndexQueryParams = Pick<
  Parameters<typeof notesIndexQuery.run>[1],
  'offset'
> & {
  types?: NoteType[] | null
}

export type NotesIndexFilterParams = Omit<NotesIndexQueryParams, 'offset'>

const editSuggestionForCard = e.shape(e.EditSuggestion, () => ({
  id: true,
  created_by: userProfileForAvatar,
  created_at: true,
  diff: true,
  target_object: (vegetable) => ({
    name: vegetableForCard(vegetable).name,
    photos: vegetableForCard(vegetable).photos,
    varieties: false,
  }),
}))

export type EditSuggestionCardData = Omit<
  Exclude<$infer<typeof editSuggestionForCard>, null>[number],
  'target_object'
> &
  // target_object is optional, and is not used in `editHistoryQuery`
  Partial<
    Pick<
      Exclude<$infer<typeof editSuggestionForCard>, null>[number],
      'target_object'
    >
  >

export const editHistoryQuery = e.params(
  {
    vegetable_id: e.uuid,
  },
  (params) =>
    e.select(e.EditSuggestion, (suggestion) => ({
      filter: e.op(
        e.op(suggestion.target_object.id, '=', params.vegetable_id),
        'and',
        e.op(suggestion.status, '=', e.EditSuggestionStatus.MERGED),
      ),

      ...editSuggestionForCard(suggestion),
      target_object: false,
    })),
)

export const pendingSuggestionsIndexQuery = e.select(
  e.EditSuggestion,
  (suggestion) => ({
    filter: e.op(suggestion.status, '=', e.EditSuggestionStatus.PENDING_REVIEW),
    order_by: {
      expression: suggestion.created_at,
      direction: e.ASC, // older suggestions first
      empty: e.EMPTY_FIRST,
    },

    ...editSuggestionForCard(suggestion),
  }),
)

export const homePageQuery = e.select({
  featured_vegetables: e.select(e.Vegetable, (vegetable) => ({
    ...vegetableForCard(vegetable),
    varieties: false,

    filter: e.op('exists', vegetable.photos),
    order_by: {
      expression: e.random(),
    },
    limit: 16,
  })),

  profiles: e.select(e.UserProfile, (profile) => ({
    ...userProfileForAvatar(profile),

    limit: 12,
    order_by: {
      expression: e.random(),
    },
  })),

  notes: e.select(e.Note, (note) => ({
    ...noteForCard(note),
    filter: e.op(
      e.op('exists', (e.global.current_user_profile)),
      'or',
      e.op(note.publish_status, '=', 'PUBLIC'),
    ),
    order_by: {
      expression: note.published_at,
      direction: e.DESC, // newest first
      empty: e.EMPTY_FIRST,
    },

    limit: 9,
  })),

  recent_contributions: e.select(e.EditSuggestion, (suggestion) => ({
    filter: e.op(suggestion.status, '=', e.EditSuggestionStatus.MERGED),
    order_by: {
      expression: suggestion.updated_at,
      direction: e.DESC, // newest first
      empty: e.EMPTY_FIRST,
    },
    limit: 12,

    ...editSuggestionForCard(suggestion),
  })),
})

export type HomePageData = Exclude<$infer<typeof homePageQuery>, null>

export const VEGETABLES_PER_WISHLIST_STATUS = 4 as const

const wishlistForProfile = e.shape(e.UserWishlist, () => ({
  status: true,
  vegetable: (vegetable) => ({
    id: true,
    handle: true,
    name: vegetable.names.index(0),
    photos: (image) => ({
      ...imageForRendering(image),

      limit: 1,
      order_by: {
        expression: image['@order_index'],
        direction: 'ASC',
        empty: e.EMPTY_LAST,
      },
    }),
  }),
}))
export type WishlistForProfile = Exclude<
  $infer<typeof wishlistForProfile>,
  null
>[number]

export const profileLayoutQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.UserProfile, (profile) => ({
      filter_single: e.op(profile.handle, '=', params.handle),

      ...userProfileForAvatar(profile),
      bio: true,
      is_owner: e.op(profile.id, '=', e.global.current_user_profile.id),

      planted: e.select(e.UserWishlist, (wishlist) => ({
        ...wishlistForProfile(wishlist),

        filter: e.op(
          e.op(wishlist.user_profile.id, '=', profile.id),
          'and',
          e.op(
            wishlist.status,
            'in',
            e.set(
              e.VegetableWishlistStatus.JA_CULTIVEI,
              e.VegetableWishlistStatus.ESTOU_CULTIVANDO,
            ),
          ),
        ),
        limit: VEGETABLES_PER_WISHLIST_STATUS,
        order_by: {
          expression: e.random(),
        },
      })),
      planted_count: e.count(
        e.select(e.UserWishlist, (wishlist) => ({
          filter: e.op(
            e.op(wishlist.user_profile.id, '=', profile.id),
            'and',
            e.op(
              wishlist.status,
              'in',
              e.set(
                e.VegetableWishlistStatus.JA_CULTIVEI,
                e.VegetableWishlistStatus.ESTOU_CULTIVANDO,
              ),
            ),
          ),
        })),
      ),
      desired: e.select(e.UserWishlist, (wishlist) => ({
        ...wishlistForProfile(wishlist),

        filter: e.op(
          e.op(wishlist.user_profile.id, '=', profile.id),
          'and',
          e.op(wishlist.status, '=', e.VegetableWishlistStatus.QUERO_CULTIVAR),
        ),
        limit: VEGETABLES_PER_WISHLIST_STATUS,
        order_by: {
          expression: e.random(),
        },
      })),
      desired_count: e.count(
        e.select(e.UserWishlist, (wishlist) => ({
          filter: e.op(
            e.op(wishlist.user_profile.id, '=', profile.id),
            'and',
            e.op(
              wishlist.status,
              '=',
              e.VegetableWishlistStatus.QUERO_CULTIVAR,
            ),
          ),
        })),
      ),

      recent_contributions: e.select(e.EditSuggestion, (suggestion) => ({
        filter: e.op(
          e.op(suggestion.status, '=', e.EditSuggestionStatus.MERGED),
          'and',
          e.op(suggestion.created_by, '=', profile),
        ),
        order_by: {
          expression: suggestion.updated_at,
          direction: e.DESC, // newest first
          empty: e.EMPTY_FIRST,
        },
        limit: 6,

        ...editSuggestionForCard(suggestion),
      })),
    })),
)

export type ProfileLayoutData = Exclude<$infer<typeof profileLayoutQuery>, null>

export const profileNotesQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.UserProfile, (profile) => ({
      filter_single: e.op(profile.handle, '=', params.handle),
      is_owner: e.op(profile.id, '=', e.global.current_user_profile.id),
      name: true,

      notes: e.select(e.Note, (note) => ({
        ...noteForCard(note),
        created_by: false,

        filter: e.op(
          e.op(note.created_by, '=', profile),
          'and',
          e.op(note.public, '=', true),
        ),
        limit: 12,
        order_by: {
          expression: e.random(),
        },
      })),

      note_count: e.count(
        e.select(e.Note, (note) => ({
          filter: e.op(
            e.op(note.created_by, '=', profile),
            'and',
            e.op(note.public, '=', true),
          ),
        })),
      ),
    })),
)

export type ProfileNotesData = Exclude<$infer<typeof profileNotesQuery>, null>

export const profileContributionsQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.UserProfile, (profile) => ({
      filter_single: e.op(profile.handle, '=', params.handle),
      is_owner: e.op(profile.id, '=', e.global.current_user_profile.id),
      name: true,

      contributions: e.select(e.EditSuggestion, (suggestion) => ({
        filter: e.op(
          e.op(suggestion.status, '=', e.EditSuggestionStatus.MERGED),
          'and',
          e.op(suggestion.created_by, '=', profile),
        ),
        order_by: {
          expression: suggestion.updated_at,
          direction: e.DESC, // newest first
          empty: e.EMPTY_FIRST,
        },

        ...editSuggestionForCard(suggestion),
      })),
    })),
)

export type ProfileContributionsData = Exclude<
  $infer<typeof profileContributionsQuery>,
  null
>

export const profileGalleryQuery = e.params(
  {
    handle: e.str,
  },
  (params) =>
    e.select(e.UserProfile, (profile) => ({
      filter_single: e.op(profile.handle, '=', params.handle),
      is_owner: e.op(profile.id, '=', e.global.current_user_profile.id),
      name: true,

      images: e.select(e.Image, (image) => ({
        filter: e.op(profile, 'in', e.assert_distinct(image.sources.users)),
        order_by: {
          expression: image.updated_at,
          direction: e.DESC, // newest first
          empty: e.EMPTY_FIRST,
        },

        ...imageForRendering(image),
      })),
    })),
)

export type ProfileGalleryData = Exclude<
  $infer<typeof profileGalleryQuery>,
  null
>

export const getMentionsDataQuery = e.params(
  { ids: e.array(e.uuid) },
  (params) =>
    e.select(e.op(e.Vegetable, 'union', e.UserProfile), (object) => ({
      filter: e.op(object.id, 'in', e.array_unpack(params.ids)),

      id: true,
      handle: true,
      ...e.is(e.Vegetable, {
        names: true,
        photos: (image) => ({
          ...imageForRendering(image),
          sources: false,
          order_by: {
            expression: image['@order_index'],
            direction: 'ASC',
            empty: e.EMPTY_LAST,
          },
        }),
      }),
      ...e.is(e.UserProfile, {
        name: true,
        photo: (image) => ({ ...imageForRendering(image), sources: false }),
      }),
    })),
)

export const peopleIndexQuery = e.select(e.UserProfile, userProfileForAvatar)

export type PeopleIndexData = Exclude<$infer<typeof peopleIndexQuery>, null>
