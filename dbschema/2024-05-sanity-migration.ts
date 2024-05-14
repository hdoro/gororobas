import { createVegetable } from '@/actions/createVegetable'
import type { Gender, SourceType, VegetableUsage } from '@/edgedb.interfaces'
import type { SourceForDB, VegetableForDB } from '@/schemas'
import { generateId } from '@/utils/ids'
import { PLANTING_METHOD_TO_LABEL } from '@/utils/labels'
import { sanityServerClientRaw } from '@/utils/sanity.client'
import { slugify } from '@/utils/strings'
import * as S from '@effect/schema/Schema'
import createClient from 'edgedb'
import { Effect, pipe } from 'effect'
import inquirer from 'inquirer'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type {
	Q_VEGETABLES_RAW_INDEXResult,
	SourceExternal,
	SourceUser,
} from './2024-05-sanity-migration.types'

type SanityVegetable = Q_VEGETABLES_RAW_INDEXResult[number]

const VEGETABLES_FILE = 'dbschema/vegetables.json'

const GENDER_MAP: Record<Required<SanityVegetable>['gender'], Gender> = {
	feminine: 'FEMININO',
	masculine: 'MASCULINO',
	neutral: 'NEUTRO',
}

const USAGE_MAP: Record<
	Required<SanityVegetable>['usage'][number],
	VegetableUsage
> = {
	ALIMENTO_ANIMAL: 'ALIMENTO_ANIMAL',
	ALIMENTO_HUMANO: 'ALIMENTO_HUMANO',
	CONSTRUCAO: 'CONSTRUCAO',
	COSMETIC: 'COSMETICO',
	MATERIA_ORGANICA: 'MATERIA_ORGANICA',
	MEDICINAL: 'MEDICINAL',
	PAISAGISMO: 'ORNAMENTAL',
	RITUALISTICO: 'RITUALISTICO',
}

const SOURCE_MAP: Record<(SourceExternal | SourceUser)['_type'], SourceType> = {
	'source.external': 'EXTERNAL',
	'source.user': 'GOROROBAS',
}

// @TODO single source
function sanitySourcesToEdgeDB(
	sources: Required<SanityVegetable>['photos'][number]['sources'],
) {
	const userId = (sources?.find((s) => s._type === 'source.user') as SourceUser)
		?.user?._ref

	const sourceType = sources?.[0]._type
		? SOURCE_MAP[sources[0]._type]
		: 'EXTERNAL'

	if (sourceType === 'GOROROBAS') {
		return {
			sourceType,
			// userIds: userId ? [userId] : undefined,
		} as SourceForDB
	}

	return {
		sourceType,
		credits: (sources?.[0] as SourceExternal | undefined)?.credits,
		source: (sources?.[0] as SourceExternal | undefined)?.source,
	} as SourceForDB
}

function sanityPhotoToEdgeDB(
	photo: Required<SanityVegetable>['photos'][number],
): Exclude<VegetableForDB['photos'], undefined>[number] {
	return {
		...sanitySourcesToEdgeDB(photo.sources),
		label: photo.label || '',
		data: {
			stored_image_id: generateId(),
			sanity_id: photo.media?.asset?._ref as string,
			hotspot: photo.media?.hotspot,
			crop: photo.media?.crop,
		},
	}
}

async function main() {
	const { fetchFreshData } = existsSync(VEGETABLES_FILE)
		? await inquirer.prompt([
				{
					type: 'confirm',
					name: 'fetchFreshData',
					message: 'Fetch fresh data from Sanity?',
				},
			] as const)
		: { fetchFreshData: true }

	const sanityVegetables = (
		fetchFreshData
			? await sanityServerClientRaw
					.withConfig({
						perspective: 'previewDrafts',
					})
					.fetch(`*[_type == 'vegetable']`)
			: JSON.parse(readFileSync(VEGETABLES_FILE, 'utf-8'))
	) as Q_VEGETABLES_RAW_INDEXResult

	if (fetchFreshData) {
		writeFileSync(VEGETABLES_FILE, JSON.stringify(sanityVegetables, null, 2))
	}

	const { deleteVegetablesInDB } = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'deleteVegetablesInDB',
			message: 'Delete vegetables in EdgeDB?',
		},
	] as const)

	if (deleteVegetablesInDB) {
		await Effect.runPromise(
			pipe(
				Effect.tryPromise({
					try: () =>
						createClient({
							// Note: when developing locally you will need to set tls security to
							// insecure, because the development server uses self-signed certificates
							// which will cause api calls with the fetch api to fail.
							tlsSecurity:
								process.env.NODE_ENV === 'development' ? 'insecure' : 'default',
						})
							.withConfig({
								allow_user_specified_id: true,
								apply_access_policies: false,
							})
							.query('DELETE Vegetable; DELETE Image;'),
					catch: (e) => {
						console.error(e)
						return Effect.succeed(undefined)
					},
				}),
				Effect.tap(() => Effect.logInfo('Deleted vegetables in EdgeDB')),
				Effect.withLogSpan('deleteVegetablesInDB'),
			),
		)
	}

	const formattedVegetables = sanityVegetables.flatMap((vegetable) => {
		if (!vegetable.names?.[0]) return []

		const formatted = {
			names: vegetable.names as unknown as VegetableForDB['names'],
			gender: vegetable.gender ? GENDER_MAP[vegetable.gender] : undefined,
			handle: vegetable.slug?.current
				? slugify(vegetable.slug.current)
				: slugify(vegetable.names[0]),
			strata: vegetable.stratum || [],
			scientific_names: vegetable.scientific_name
				? [vegetable.scientific_name]
				: [],
			uses: (vegetable.usage || []).flatMap((usage) => USAGE_MAP[usage] || []),
			edible_parts: vegetable.edible_part || [],
			planting_methods: (vegetable.planting_method || []).flatMap((method) =>
				method in PLANTING_METHOD_TO_LABEL ? method : [],
			),
			lifecycles: vegetable.cycle || [],
			height_max: vegetable.height_max || 0,
			height_min: vegetable.height_min || 0,
			origin: vegetable.origin || '',
			photos: vegetable.photos?.map(sanityPhotoToEdgeDB),
			varieties: (vegetable.varieties || []).map((variety) => {
				return {
					names: (variety.names as unknown as VegetableForDB['names']) || [],
					photos: variety.photos?.map(sanityPhotoToEdgeDB),
					id: S.is(S.UUID)(variety._key) ? variety._key : generateId(),
				}
			}),
			// tips: (vegetable.tips || []).map((tip) => {
			// 	return {
			// 		id: S.is(S.UUID)(tip._key) ? tip._key : generateId(),
			// 		subjects: [tip.subject],
			// 		...sanitySourcesToEdgeDB(tip.sources),
			// 	}
			// }),
		} satisfies VegetableForDB

		// S.asserts(formatted)

		return formatted
	})

	console.time('Creating vegetables')
	const failed: typeof formattedVegetables = []
	await Effect.runPromise(
		Effect.forEach(
			formattedVegetables,
			(vegetable) =>
				pipe(
					Effect.tryPromise(() =>
						createVegetable(
							vegetable,
							createClient({
								// Note: when developing locally you will need to set tls security to
								// insecure, because the development server uses self-signed certificates
								// which will cause api calls with the fetch api to fail.
								tlsSecurity:
									process.env.NODE_ENV === 'development'
										? 'insecure'
										: 'default',
							}).withConfig({
								allow_user_specified_id: true,
								apply_access_policies: false,
							}),
						),
					),
					Effect.tap(() => Effect.logDebug(`Created ${vegetable.names[0]}`)),
					Effect.tapError((error) => {
						failed.push(vegetable)
						return Effect.logError(
							`Failed to create ${vegetable.names[0]}`,
							error,
						)
					}),
					Effect.catchAll(() => Effect.succeed('')),
					Effect.withLogSpan('createVegetable'),
				),
			{ concurrency: 1 },
		),
	)
	console.timeEnd('Creating vegetables')

	if (failed.length) {
		console.error('\n\n\nFailed to create the following vegetables:')
		console.error(failed)
	}
}

main()
