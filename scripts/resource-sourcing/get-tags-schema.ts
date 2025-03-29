import { Path } from '@effect/platform'
import { Effect } from 'effect'
import { glob } from 'glob'
import { z, type ZodLiteral } from 'zod'
import { processTagFile } from '../resource-library-bootstrap/import-resources'
import { SCRIPT_PATHS } from '../script.utils'

export const getTagsSchema = Effect.gen(function* () {
  const path = yield* Path.Path
  const tagFiles = yield* Effect.tryPromise(() =>
    glob(path.join(SCRIPT_PATHS.tags.root, '**/*.md'), {
      ignore: path.join(SCRIPT_PATHS.tags.root, 'tag.template.md'),
    }),
  )
  const tags = yield* Effect.all(tagFiles.map(processTagFile), {
    concurrency: 'unbounded',
  })

  return {
    tags,
    schema: z.array(
      z.union(
        tags.map((t) =>
          z.literal(t.handle, {
            description: `Sinônimos: ${t.names.join(', ')}`,
          }),
        ) as unknown as Readonly<
          [ZodLiteral<string>, ZodLiteral<string>, ...ZodLiteral<string>[]]
        >,
      ),
      {
        description:
          'Lista de tags disponíveis. Selecionar apenas desta lista, se atentar à pontuação',
      },
    ),
  }
})

export type TagsForAISchema = Effect.Effect.Success<typeof getTagsSchema>
