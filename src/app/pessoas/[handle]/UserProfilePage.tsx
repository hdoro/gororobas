import NotesGrid from '@/components/NotesGrid'
import SectionTitle from '@/components/SectionTitle'
import { UserPhoto } from '@/components/UserAvatar'
import VegetableCard from '@/components/VegetableCard'
import NoteIcon from '@/components/icons/NoteIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { UserProfileageData } from '@/queries'
import { truncate } from '@/utils/strings'
import { paths } from '@/utils/urls'
import { Edit2Icon } from 'lucide-react'
import Link from 'next/link'

export default function UserProfilePage({
	profile,
}: { profile: UserProfileageData }) {
	const desiredVegetables = profile.wishlist.flatMap((userWishlist) =>
		userWishlist.status === 'QUERO_CULTIVAR' ? userWishlist.vegetable : [],
	)
	const plantedVegetables = profile.wishlist.flatMap((userWishlist) =>
		userWishlist.status === 'ESTOU_CULTIVANDO' ||
		userWishlist.status === 'JA_CULTIVEI'
			? userWishlist.vegetable
			: [],
	)
	console.log(profile.wishlist)
	return (
		<main className="px-pageX py-10">
			<div className="flex items-start flex-wrap gap-6">
				<UserPhoto user={profile} size="lg" />
				<div className="self-center">
					<div className="flex flex-wrap gap-5 items-center">
						<Text level="h1" as="h1">
							{profile.name}
						</Text>
						{profile.is_owner && (
							<div className="space-x-3">
								<Button size="sm" asChild>
									<Link href={paths.editProfile()}>
										<Edit2Icon className="w-[1.25em]" />
										Editar perfil
									</Link>
								</Button>
								<Button size="sm" asChild tone="secondary" mode="outline">
									<Link href={paths.signout()}>
										<Edit2Icon className="w-[1.25em]" />
										Sair ou trocar conta
									</Link>
								</Button>
							</div>
						)}
					</div>
					<Text level="h3" as="p" className="mt-1">
						{profile.location}
					</Text>

					{profile.bio ? (
						<Text className="mt-2 max-w-md box-content" as="div">
							<h2 className="sr-only">Sobre {profile.name}</h2>
							<TipTapRenderer content={profile.bio} />
						</Text>
					) : null}
				</div>
			</div>

			{profile.notes && profile.notes.length > 0 && (
				<section className="mt-16">
					<SectionTitle Icon={NoteIcon}>
						Notinhas que{' '}
						{profile.is_owner ? 'você' : truncate(profile.name, 20)}{' '}
						compartilhou
					</SectionTitle>
					<NotesGrid notes={profile.notes} />
				</section>
			)}

			{desiredVegetables.length > 0 && (
				<section className="mt-24" id="amizades">
					<SectionTitle Icon={RainbowIcon}>
						{profile.is_owner ? 'Sua listinha de desejos' : 'Quer plantar'}
					</SectionTitle>
					<div className="overflow-x-auto flex gap-x-9 gap-y-7 mt-3 px-pageX">
						{desiredVegetables.map((vegetable) => (
							<VegetableCard key={vegetable.handle} vegetable={vegetable} />
						))}
					</div>
				</section>
			)}

			{plantedVegetables.length > 0 && (
				<section className="mt-24" id="amizades">
					<SectionTitle Icon={SeedlingIcon}>
						{profile.is_owner ? 'Você planta' : `${profile.name} planta`}
					</SectionTitle>
					<div className="overflow-x-auto flex gap-x-9 gap-y-7 mt-3 px-pageX">
						{plantedVegetables.map((vegetable) => (
							<VegetableCard key={vegetable.handle} vegetable={vegetable} />
						))}
					</div>
				</section>
			)}
		</main>
	)
}
