import { auth } from '@/edgedb'
import {
	type ImageForRenderingData,
	type SourceCardData,
	type VegetableEditingData,
	vegetableEditingQuery,
} from '@/queries'
import {
	type ImageObjectInDB,
	type RichTextValue,
	type SourceForDB,
	VegetableData,
	type VegetableForDBWithImages,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type { ImageForRendering } from '@/types'
import { InvalidInputError } from '@/types/errors'
import { paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import EditVegetableForm from './EditVegetableForm'

export function vegetableEditingToForDBWithImages(
	vegetable: VegetableEditingData,
): VegetableForDBWithImages {
	return {
		id: vegetable.id,
		handle: vegetable.handle,
		names: vegetable.names as unknown as VegetableForDBWithImages['names'],
		scientific_names: vegetable.scientific_names,
		content: (vegetable.content as RichTextValue) || undefined,
		friends: vegetable.friends.map((friend) => friend.id),
		height_max: vegetable.height_max,
		height_min: vegetable.height_min,
		temperature_max: vegetable.temperature_max,
		temperature_min: vegetable.temperature_min,
		gender: vegetable.gender,
		lifecycles: vegetable.lifecycles,
		strata: vegetable.strata,
		planting_methods: vegetable.planting_methods,
		edible_parts: vegetable.edible_parts,
		origin: vegetable.origin,
		uses: vegetable.uses,
		sources: vegetable.sources.map(formatQueriedSource),
		photos: vegetable.photos.map(formatQueriedImage),
		varieties: vegetable.varieties.map((variety) => ({
			id: variety.id,
			names: variety.names as unknown as VegetableForDBWithImages['names'], // casting to non-empty array
			photos: variety.photos.map(formatQueriedImage),
		})),
	}
}

function getRouteData(handle: string) {
	const session = auth.getSession()

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => vegetableEditingQuery.run(session.client, { handle }),
				catch: (error) => console.log(error),
			}),
			Effect.flatMap((vegetable) => {
				if (!vegetable)
					return Effect.fail(new InvalidInputError(vegetable, VegetableData))

				return Effect.succeed(vegetableEditingToForDBWithImages(vegetable))
			}),
			...buildTraceAndMetrics('vegetable_page', { handle }),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)
}

function formatQueriedSource(source: SourceCardData): SourceForDB {
	if (source.type === 'EXTERNAL') {
		return {
			id: source.id,
			type: source.type,
			credits: source.credits || '',
			comments: source.comments as RichTextValue,
			origin: source.origin,
		}
	}

	return {
		id: source.id,
		type: source.type,
		comments: source.comments as RichTextValue,
		userIds: source.users.map((user) => user.id) as [string, ...string[]],
	}
}

function formatQueriedImage(
	image: ImageForRenderingData,
): typeof ImageObjectInDB.Type {
	return {
		id: image.id,
		label: image.label,
		sources: image.sources.map(formatQueriedSource),
		sanity_id: image.sanity_id,
		crop: image.crop as Exclude<ImageForRendering['crop'], unknown>,
		hotspot: image.hotspot as Exclude<ImageForRendering['hotspot'], unknown>,
	}
}

export async function generateMetadata({
	params,
}: {
	params: { handle: string }
}): Promise<Metadata> {
	const vegetable = await getRouteData(params.handle)

	if (!vegetable) {
		return {}
	}

	return {
		title: `Editar ${vegetable.names[0] || 'Vegetal'} | Gororobas`,
	}
}

export default async function EditVegetableRoute({
	params: { handle },
}: {
	params: { handle: string }
}) {
	const session = auth.getSession()

	if (!(await session.isSignedIn())) {
		redirect(paths.signinNotice(paths.editVegetable(handle)))
	}

	const vegetableForDBWithImages = await getRouteData(handle)

	if (!vegetableForDBWithImages) return notFound()

	const vegetableInForm = await pipe(
		Schema.encode(VegetableData)(vegetableForDBWithImages),
		Effect.runPromise,
	)

	return (
		<EditVegetableForm
			vegetableForDBWithImages={vegetableForDBWithImages}
			vegetableInForm={vegetableInForm}
		/>
	)
}
