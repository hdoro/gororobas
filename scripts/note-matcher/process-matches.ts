import type { Note } from '@/edgedb.interfaces'
import {
  insertVegetableMutation,
  relate_note_to_vegetable_mutation,
} from '@/mutations'
import { generateId } from '@/utils/ids'
import { Effect } from 'effect'
import { readdirSync, readFileSync, renameSync } from 'fs'
import {
  APPLIED_FOLDER,
  noteMatcherClient,
  PROCESSED_FOLDER,
  type SuggestedMutation,
} from './note-matcher.utils'

type MatchFile = {
  text: string
  suggested_mutations: SuggestedMutation[]
  note: Pick<Note, 'id' | 'body' | 'title'>
}

const mutationsToProcess = readdirSync(PROCESSED_FOLDER).map((fileName) => {
  return {
    match: JSON.parse(
      readFileSync(`${PROCESSED_FOLDER}/${fileName}`).toString(),
    ) as MatchFile,
    fileName,
  }
})

function process_match_file({
  match,
  fileName,
}: {
  match: MatchFile
  fileName: string
}) {
  return Effect.gen(function* (_) {
    yield* Effect.log(`Processing ${fileName}`)

    yield* Effect.tryPromise(() =>
      noteMatcherClient
        .withConfig({
          allow_user_specified_id: true,
          apply_access_policies: false,
        })
        .transaction(async (tx) => {
          for (const mutation of match.suggested_mutations) {
            if (!mutation.approved) {
              console.info(`Mutation skipped for note ${match.note.id}`)
              continue
            }

            const new_vegetable_id = generateId()
            if (mutation.type === 'create-vegetable') {
              const input = mutation.vegetable
              await insertVegetableMutation.run(tx, {
                id: new_vegetable_id,
                names: input.names,
                handle: input.handle,
                scientific_names: input.scientific_names ?? null,
                gender: input.gender ?? null,
                strata: input.strata ?? null,
                development_cycle_max: input.development_cycle_max ?? null,
                development_cycle_min: input.development_cycle_min ?? null,
                height_max: input.height_max ?? null,
                height_min: input.height_min ?? null,
                temperature_max: input.temperature_max ?? null,
                temperature_min: input.temperature_min ?? null,
                origin: input.origin ?? null,
                uses: input.uses ?? null,
                planting_methods: input.planting_methods ?? null,
                edible_parts: input.edible_parts ?? null,
                lifecycles: input.lifecycles ?? null,
                content: input.content ?? null,
                photos: [],
                sources: [],
                varieties: [],
              })
            }

            const vegetable_to_relate =
              mutation.type === 'create-vegetable'
                ? new_vegetable_id
                : mutation.vegetable.id

            await relate_note_to_vegetable_mutation.run(tx, {
              note_id: match.note.id,
              vegetable_id: vegetable_to_relate,
            })
          }
        }),
    )

    // Once done, move file to APPLIED_FOLDER
    renameSync(
      `${PROCESSED_FOLDER}/${fileName}`,
      `${APPLIED_FOLDER}/${fileName}`,
    )
  })
}

await Effect.runPromise(
  Effect.all(mutationsToProcess.map(process_match_file), { concurrency: 2 }),
)
