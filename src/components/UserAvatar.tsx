import type { NewImage, StoredImage } from '@/schemas'
import type { ImageForRendering } from '@/types'
import { cn } from '@/utils/cn'
import { paths } from '@/utils/urls'
import { SproutIcon } from 'lucide-react'
import Link from 'next/link'
import { type VariantProps, tv } from 'tailwind-variants'
import { SanityImage } from './SanityImage'
import { Text } from './ui/text'

const avatarVariants = tv({
	slots: {
		root: 'flex-shrink-0 flex items-center flex-wrap',
		image: 'block object-cover rounded-full',
		name: 'max-w-[16ch] truncate',
		location: '',
	},
	variants: {
		size: {
			sm: {
				root: 'gap-2',
				image: 'w-7 h-7',
			},
			md: {
				root: 'gap-3',
				image: 'w-24 h-24',
				name: 'text-lg',
			},
			lg: {
				root: 'gap-4',
				image: 'w-40 h-40',
				name: 'text-4xl',
				location: 'text-2xl',
			},
		},
		includeName: {
			true: {},
			false: {},
		},
	},
	defaultVariants: {
		size: 'sm',
		includeName: true,
	},
})

type UserAvatarProps = VariantProps<typeof avatarVariants> & {
	user: {
		name?: string | undefined | null
		handle?: string | undefined | null
		location?: string | undefined | null
		photo?:
			| ImageForRendering
			| typeof NewImage.Encoded
			| typeof StoredImage.Encoded
			| null
			| undefined
	}
	fallbackTone?: 'primary' | 'secondary'
	linkToProfile?: boolean
}

export default function UserAvatar(props: UserAvatarProps) {
	const { user, size = 'sm', includeName = true, linkToProfile = true } = props

	if (includeName && !user.name) return null

	const classes = avatarVariants({ size, includeName })

	const RootComponent = linkToProfile && user.handle ? Link : 'div'
	return (
		<RootComponent
			key={user.name}
			className={classes.root()}
			// @ts-expect-error href is only needed when using Link
			href={
				linkToProfile && user.handle
					? paths.userProfile(user.handle)
					: undefined
			}
		>
			<UserPhoto {...props} />
			{includeName && (
				<div className="space-2">
					<Text className={classes.name()}>{user.name}</Text>
					{user.location && (
						<Text level="sm" className={classes.location()}>
							{user.location}
						</Text>
					)}
				</div>
			)}
		</RootComponent>
	)
}

const SIZE_MAP: Record<Exclude<UserAvatarProps['size'], undefined>, number> = {
	sm: 28,
	md: 100,
	lg: 160,
}

export function UserPhoto({
	user,
	fallbackTone = 'primary',
	size = 'sm',
	includeName = true,
}: UserAvatarProps) {
	const { photo } = user
	const classes = avatarVariants({ size, includeName })

	if (photo && 'file' in photo && photo.file instanceof File) {
		return (
			<img
				src={URL.createObjectURL(photo.file)}
				alt={'Foto de perfil'}
				className={classes.image()}
			/>
		)
	}

	if (photo && 'sanity_id' in photo) {
		return (
			<SanityImage
				image={photo}
				alt={'Foto de perfil'}
				maxWidth={SIZE_MAP[size]}
				className={classes.image()}
			/>
		)
	}

	return (
		<div
			className={cn(
				classes.image(),
				'flex items-center justify-center',
				fallbackTone === 'primary' ? 'bg-primary-200' : 'bg-secondary-200',
			)}
		>
			<SproutIcon
				className={cn(
					'w-[70%]',
					fallbackTone === 'primary'
						? 'text-primary-700'
						: 'text-secondary-700',
				)}
			/>
		</div>
	)
}
