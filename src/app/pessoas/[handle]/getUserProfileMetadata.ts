import type { VegetableWishlistStatus } from '@/edgedb.interfaces'
import type { UserProfilePageData } from '@/queries'
import { imageBuilder } from '@/utils/imageBuilder'
import { truncate } from '@/utils/strings'
import { pathToAbsUrl, paths } from '@/utils/urls'
import type { Metadata } from 'next'

export default function getUserProfileMetadata(
	profile: UserProfilePageData | null,
): Metadata {
	const name = profile?.name

	if (!profile)
		return {
			title: 'Perfil não encontrado no Gororobas',
		}

	if (!name) {
		return {
			title: 'Pessoa sem nome | Gororobas',
		}
	}

	const wishlistStatusCount = profile.wishlist.reduce(
		(acc, w) => {
			acc[w.status] += 1
			return acc
		},
		{
			ESTOU_CULTIVANDO: 0,
			QUERO_CULTIVAR: 0,
			JA_CULTIVEI: 0,
			SEM_INTERESSE: 0,
		} satisfies Record<VegetableWishlistStatus, number>,
	)

	const firstName = name.split(' ')[0]
	const description = [
		profile.location && `${firstName} é de ${profile.location}`,
		wishlistStatusCount.ESTOU_CULTIVANDO > 0 &&
			`está cultivando ${wishlistStatusCount.ESTOU_CULTIVANDO} vegetais`,
		wishlistStatusCount.QUERO_CULTIVAR > 0 &&
			`quer cultivar ${
				wishlistStatusCount.ESTOU_CULTIVANDO > 0 ? 'outras ' : ''
			}${wishlistStatusCount.QUERO_CULTIVAR} plantas`,
		profile.notes.length > 0 && `e já enviou ${profile.notes.length} notas`,
	]
		.flatMap((p) => p || [])
		.join(',')

	const { photo } = profile
	return {
		title: `${name} | Gororobas`,
		description: truncate(description, 240),
		alternates: {
			canonical: pathToAbsUrl(paths.userProfile(profile.handle)),
		},
		// @ts-expect-error profile can have a non-image
		openGraph: {
			type: 'profile',
			firstName,
			lastName: name.split(' ').slice(1).join(' '),
			username: profile.handle,
			countryName: profile.location || undefined,
			url: pathToAbsUrl(paths.userProfile(profile.handle)),
			images: photo
				? [
						{
							url: imageBuilder
								.image({
									asset: {
										_ref: photo.sanity_id,
									},
									crop: photo.crop,
									hotspot: photo.hotspot,
								})
								.width(1200)
								.height(630)
								.quality(80)
								.crop('center')
								.auto('format')
								.url(),
							width: 1200,
							height: 630,
							alt: `Foto de ${name}`,
						},
						// For WhatsApp
						{
							url: imageBuilder
								.image({
									asset: {
										_ref: photo.sanity_id,
									},
									crop: photo.crop,
									hotspot: photo.hotspot,
								})
								.width(600)
								.height(600)
								.quality(80)
								.crop('center')
								.auto('format')
								.url(),
							width: 600,
							height: 600,
							alt: `Foto de ${name}`,
						},
					]
				: undefined,
		},
	}
}
