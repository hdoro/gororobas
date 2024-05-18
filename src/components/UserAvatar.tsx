import type { NewImage, StoredImage } from '@/schemas'
import type { ImageForRendering } from '@/types'
import { cn } from '@/utils/cn'
import { SproutIcon } from 'lucide-react'
import { type VariantProps, tv } from 'tailwind-variants'
import { SanityImage } from './SanityImage'
import { Text } from './ui/text'

const avatarVariants = tv({
	slots: {
		root: 'flex-shrink-0 flex items-center',
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
			lg: {
				root: 'gap-3',
				image: 'w-24 h-24',
				name: 'text-lg',
			},
		},
	},
	defaultVariants: {
		size: 'sm',
	},
})

type UserAvatarProps = {
	user: {
		name?: string | undefined
		handle?: string | undefined
		location?: string | undefined
		photo?:
			| ImageForRendering
			| typeof NewImage.Encoded
			| typeof StoredImage.Encoded
			| null
			| undefined
	}
	fallbackTone?: 'primary' | 'secondary'
} & VariantProps<typeof avatarVariants>

export default function UserAvatar(props: UserAvatarProps) {
	const { user, size } = props

	if (!user.name) return null

	const classes = avatarVariants({ size })

	return (
		<div key={user.name} className={classes.root()}>
			<Photo {...props} imageClasses={classes.image()} />
			<div className="space-2">
				<Text className={classes.name()}>{user.name}</Text>
				{user.location && (
					<Text level="sm" className={classes.location()}>
						{user.location}
					</Text>
				)}
			</div>
		</div>
	)
}

function Photo({
	imageClasses,
	user,
	fallbackTone,
	size,
}: UserAvatarProps & { imageClasses: string }) {
	const { photo } = user

	if (photo && 'file' in photo && photo.file instanceof File) {
		return (
			<img
				src={URL.createObjectURL(photo.file)}
				alt={'Foto de perfil'}
				className={imageClasses}
			/>
		)
	}

	if (photo && 'sanity_id' in photo) {
		return (
			<SanityImage
				image={photo}
				alt={'Foto de perfil'}
				maxWidth={size === 'sm' ? 28 : 100}
				className={imageClasses}
			/>
		)
	}

	return (
		<div
			className={cn(
				imageClasses,
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
