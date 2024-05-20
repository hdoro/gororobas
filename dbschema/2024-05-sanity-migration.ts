import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createVegetable } from '@/actions/createVegetable'
import { formatVegetableFriendForDB } from '@/actions/formatVegetableFriendForDB'
import type {
	Gender,
	SourceType,
	TipSubject,
	VegetableUsage,
} from '@/edgedb.interfaces'
import { insertVegetableFriendshipsMutation } from '@/mutations'
import type { SourceForDB, VegetableForDB } from '@/schemas'
import { generateId } from '@/utils/ids'
import { PLANTING_METHOD_TO_LABEL } from '@/utils/labels'
import { sanityServerClientRaw } from '@/utils/sanity.client'
import { slugify } from '@/utils/strings'
import * as S from '@effect/schema/Schema'
import createClient from 'edgedb'
import { Effect, LogLevel, Logger, pipe } from 'effect'
import inquirer from 'inquirer'
import type {
	Q_VEGETABLES_RAW_INDEXResult,
	SourceExternal,
	SourceUser,
} from './2024-05-sanity-migration.types'
import ptToTiptap from './richTextConversions'

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

const TIP_SUBJECT_MAP: Record<
	Required<Required<SanityVegetable>['tips'][number]>['subject'],
	TipSubject
> = {
	colheita: 'COLHEITA',
	crescimento: 'CRESCIMENTO',
	plantio: 'PLANTIO',
}

function sanitySourcesToEdgeDB(
	sources: Required<SanityVegetable>['photos'][number]['sources'],
): SourceForDB[] {
	return (sources || []).flatMap((source) => {
		const sourceType = SOURCE_MAP[source._type]
		if (!sourceType) return []

		if (sourceType === 'GOROROBAS') {
			// @TODO migrate users?
			const userId = (
				sources?.find((s) => s._type === 'source.user') as SourceUser
			)?.user?._ref
			return {
				id: S.is(S.UUID)(source._key) ? source._key : generateId(),
				type: sourceType,
				userIds: [],
				// userIds: userId ? [userId] : undefined,
			} satisfies SourceForDB
		}

		return {
			id: S.is(S.UUID)(source._key) ? source._key : generateId(),
			type: sourceType,
			credits: (sources?.[0] as SourceExternal | undefined)?.credits || '',
			origin: (sources?.[0] as SourceExternal | undefined)?.source || '',
		} satisfies SourceForDB
	})
}

function sanityPhotoToEdgeDB(
	photo: Required<SanityVegetable>['photos'][number],
): Exclude<VegetableForDB['photos'], undefined>[number] {
	return {
		id: generateId(),
		label: photo.label || '',
		data: {
			sanity_id: photo.media?.asset?._ref as string,
			hotspot: photo.media?.hotspot,
			crop: photo.media?.crop,
		},
		sources: sanitySourcesToEdgeDB(photo.sources),
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
					.fetch(/* groq */ `*[_type == 'vegetable']{
						...,
						"friends": array::unique(
							friends[]._ref + *[_type == "vegetable"&& references(^._id)]._id
						),
					}`)
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

	const edgeDBClient = createClient({
		// Note: when developing locally you will need to set tls security to
		// insecure, because the development server uses self-signed certificates
		// which will cause api calls with the fetch api to fail.
		tlsSecurity:
			process.env.NODE_ENV === 'development' ? 'insecure' : 'default',
	}).withConfig({
		allow_user_specified_id: true,
		apply_access_policies: false,
	})
	if (deleteVegetablesInDB) {
		await Effect.runPromise(
			pipe(
				Effect.tryPromise({
					try: () => edgeDBClient.query('DELETE Vegetable; DELETE Image;'),
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
			id: vegetable._id,
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
			height_max: vegetable.height_max ?? undefined,
			height_min: vegetable.height_min ?? undefined,
			origin: vegetable.origin || '',
			content: Array.isArray(vegetable.content)
				? ptToTiptap(vegetable.content)
				: undefined,
			photos: vegetable.photos?.map(sanityPhotoToEdgeDB),
			varieties: (vegetable.varieties || []).map((variety) => {
				return {
					names: (variety.names as unknown as VegetableForDB['names']) || [],
					photos: variety.photos?.map(sanityPhotoToEdgeDB),
					id: S.is(S.UUID)(variety._key) ? variety._key : generateId(),
				}
			}),
			tips: (vegetable.tips || []).map((tip) => {
				return {
					id: S.is(S.UUID)(tip._key) ? tip._key : generateId(),
					subjects:
						tip.subject && TIP_SUBJECT_MAP[tip.subject]
							? [TIP_SUBJECT_MAP[tip.subject]]
							: [],
					content: ptToTiptap(tip.content || []),
					sources: sanitySourcesToEdgeDB(tip.sources),
				}
			}),
			friends: vegetable.friends || [],
		} satisfies VegetableForDB

		return formatted
	})

	const failed: typeof formattedVegetables = []
	await pipe(
		// #1 Create vegetables without friends
		Effect.forEach(
			formattedVegetables,
			(vegetable) =>
				pipe(
					Effect.tryPromise(() =>
						createVegetable({ ...vegetable, friends: [] }, edgeDBClient),
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
					Effect.withLogSpan('createVegetableWithoutFriends'),
				),
			{ concurrency: 1 },
		),
		// #2 Now that all vegetables are in place, create friendships
		Effect.tap(() =>
			Effect.forEach(
				formattedVegetables.filter((v) => v.friends && v.friends.length > 0),
				(vegetable) =>
					pipe(
						Effect.tryPromise({
							try: () =>
								insertVegetableFriendshipsMutation.run(edgeDBClient, {
									friends: vegetable.friends.map((friend_id) =>
										formatVegetableFriendForDB(friend_id, vegetable.id),
									),
									vegetable_id: vegetable.id,
								}),
							catch: (error) => {
								failed.push(vegetable)
								console.log(
									`Failed to create friendships for ${vegetable.names[0]}\n\n\n\n`,
									{
										friends: vegetable.friends.map((friend_id) =>
											formatVegetableFriendForDB(friend_id, vegetable.id),
										),
										vegetable_id: vegetable.id,
									},
									insertVegetableFriendshipsMutation.toEdgeQL(),
									'\n\n\n',
									error,
								)
							},
						}),
						Effect.tap(() =>
							Effect.logDebug(`Created friendships of ${vegetable.names[0]}`),
						),
						Effect.catchAll(() => Effect.succeed('')),
						Effect.withLogSpan('createVegetableFriendships'),
					),
				{ concurrency: 1 },
			),
		),
		// Logger.withMinimumLogLevel(LogLevel.Debug),
		Effect.runPromise,
	)

	if (failed.length) {
		console.error('\n\n\nFailed to create the following vegetables:')
		console.error(failed)
	}
}

main()
