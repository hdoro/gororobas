import { slugify } from '@/utils/strings'
import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { Effect } from 'effect'
import { existsSync, writeFileSync } from 'fs'
import { z } from 'zod'
import { tiptapJSONtoPlainText } from '../../src/utils/tiptap'
import {
  APPLIED_FOLDER,
  noteMatcherClient,
  PROCESSED_FOLDER,
  UNPROCESSED_FOLDER,
  type SuggestedMutation,
} from './note-matcher.utils'

const LAST_PROCESSED = new Date(0).toISOString()

export const VEGETABLES = await noteMatcherClient.query<{
  id: string
  nome_comum: string
  nomes_alternativos: string[]
  nomes_cientificos: string[]
  handle: string
}>(`
select Vegetable {
  id,
  nome_comum := .names[0],
  nomes_alternativos := .names[1:],
  nomes_cientificos := .scientific_names,
  handle,
}`)

if (!VEGETABLES.length) {
  throw new Error('vegetais falharam')
} else {
  console.log(`${VEGETABLES.length} vegetais`)
}

const NOTES = await noteMatcherClient.query<{
  id: string
  title: JSON
  body: JSON
}>(`
select Note {
  id,
  title,
  body,
}
  filter count(.related_to_vegetables) = 0 and .updated_at > <datetime>'${LAST_PROCESSED}'
  limit 20`)

if (!NOTES.length) {
  throw new Error('notas falharam')
} else {
  console.log(`${NOTES.length} notas`)
}

const VEGETABLE_LOOKUP = VEGETABLES.reduce(
  (acc, veg) => {
    const searchTerms = [
      veg.nome_comum,
      ...veg.nomes_alternativos,
      ...veg.nomes_cientificos,
    ].map((term) => slugify(term))

    searchTerms.forEach((term) => {
      acc[term] = veg.id
    })
    return acc
  },
  {} as Record<string, string>,
)

const SCHEMA = z.object({
  vegetais_citados: z
    .array(
      z.object({
        nome_comum: z.string().describe('Nome mais comum do vegetal citado'),
        sinonimos: z
          .array(z.string())
          .nullable()
          .describe(
            'Sinônimos do vegetal citado, incluindo regionalismos (ex: mandioca, aipim, macaxeira)',
          ),
        nomes_cientificos: z
          .array(z.string())
          .nullable()
          .describe(
            'Nomes científicos das possíveis espécies do vegetal citado, se conhecido (ex: Carica papaya para o mamão; Adansonia grandidieri, Adansonia digitata e outros para o baobá)',
          ),
        razao: z
          .string()
          .describe(
            'Curta explicação de como este vegetal se apresenta no texto',
          ),
      }),
    )
    .describe('Vegetais citados na nota, direta ou indiretamente'),
})

const SYSTEM_PROMPT = `
Você classifica notas variadas, listando apenas os **vegetais contidos em seu conteúdo, direta ou indiretamente**. Fatores a se considerar:

- Vegetais podem aparecer como ingredientes processados, como a maizena derivada do milho, ou cozidos/preparados, como a pipoca (também do milho), o açúcar da cana, a goiabada da goiaba, e o cafezinho.
- Podem aparecer com diversos nomes, regionalismos e gírias, como "aipim" e "macaxeira" para a mandioca, ou "tomatin" para o tomate. \`nomes_alternativos\` são providenciados no banco de dados.
- Podem aparecer com nomes científicos, como "Ananas comosus" para o abacaxi. \`nomes_cientificos\` são providenciados no banco de dados.
- Podem não ser citados diretamente, mas aparecerem como ingredientes de 2ª ou 3ª ordem. Por exemplo, o macarrão pode ser feito de trigo, arroz e outros; quando não especificado, considerar o mais comum, neste caso o trigo.
- **Retorne apenas os vegetais que atendam aos requisitos acima.**
- Se não houver nenhum vegetal na nota, retorne uma lista vazia
- Não inclua resultados genéricos, como "madeira" ou "capim"
`

function parseNote(note: (typeof NOTES)[number]) {
  return Effect.gen(function* (_) {
    yield* Effect.log(`Parsing note ${note.id}`)

    const title = note.title ? tiptapJSONtoPlainText(note.title) : ''
    const body = note.body ? tiptapJSONtoPlainText(note.body) : ''
    const text = [title, body].filter(Boolean).join('\n\n\n')

    if (
      existsSync(`${UNPROCESSED_FOLDER}/${note.id}.json`) ||
      existsSync(`${PROCESSED_FOLDER}/${note.id}.json`) ||
      existsSync(`${APPLIED_FOLDER}/${note.id}.json`)
    ) {
      console.log(`Note ${note.id} already processed`)
      return
    }

    const prompt = `
    Analise o texto abaixo em busca de vegetais, segundo instruções do sistema:
    
    Texto: "${text}"
    `

    const result = yield* Effect.tryPromise(() =>
      generateObject({
        model: anthropic('claude-3-5-haiku-20241022', {
          cacheControl: true,
        }),
        schema: SCHEMA,
        prompt,
        system: SYSTEM_PROMPT,
      }),
    )

    const matches = result.object.vegetais_citados.map((match) => {
      const vegetable_lookups = [
        VEGETABLE_LOOKUP[slugify(match.nome_comum)],
        ...(match.nomes_cientificos || []).map(
          (n) => VEGETABLE_LOOKUP[slugify(n)],
        ),
        ...(match.sinonimos || []).map((n) => VEGETABLE_LOOKUP[slugify(n)]),
      ].filter(Boolean)

      const possible_vegetables = vegetable_lookups
        .flatMap((l) => VEGETABLES.find((v) => v.id === l) || [])
        // De-duplicate
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i)

      return {
        match,
        possible_vegetables,
      }
    })

    const suggested_mutations = matches.flatMap<SuggestedMutation>(
      ({ match, possible_vegetables }) => {
        if (possible_vegetables.length === 0) {
          const names = [match.nome_comum, ...(match.sinonimos || [])].filter(
            // de-duplicate names
            (name, index, arr) => arr.indexOf(name) === index,
          )
          const scientific_names = match.nomes_cientificos || []

          const possible_handles = [...names, ...scientific_names]
          const handle =
            possible_handles.find(
              (s) => !VEGETABLES.find((v) => v.handle === slugify(s)),
            ) ||
            (possible_handles.length > 1
              ? possible_handles.join('-')
              : `${possible_handles[0]}-1`)
          return {
            type: 'create-vegetable',
            status: 'pending',
            reason: match.razao,
            vegetable: {
              names,
              scientific_names,
              handle: slugify(handle),
            },
          }
        }

        return possible_vegetables.map((vegetable) => ({
          type: 'relate-note',
          status: 'pending',
          vegetable,
          reason: match.razao,
        }))
      },
    )

    writeFileSync(
      `${UNPROCESSED_FOLDER}/${note.id}.json`,
      JSON.stringify(
        {
          text,
          suggested_mutations,
          matches,
          result,
          note,
        },
        null,
        2,
      ),
    )
  })
}

await Effect.runPromise(Effect.all(NOTES.map(parseNote), { concurrency: 4 }))
