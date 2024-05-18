import type { NewImage, StoredImage } from '@/schemas'
import type { ImageForRendering } from '@/types'
import { cn } from '@/utils/cn'
import { SproutIcon } from 'lucide-react'
import { useMemo } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
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

export default function UserAvatar({
	user,
	fallbackTone,
	size,
}: {
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
} & VariantProps<typeof avatarVariants>) {
	if (!user.name) return null

	const classes = avatarVariants({ size })
	const { photo } = user

	const imageClasses = classes.image()

	const Photo = useMemo(() => {
		if (photo) {
			if ('file' in photo && photo.file instanceof File) {
				return (
					<img
						src={URL.createObjectURL(photo.file)}
						alt={'Foto de perfil'}
						className={imageClasses}
					/>
				)
			}

			if ('sanity_id' in photo) {
				return (
					<SanityImage
						image={photo}
						alt={'Foto de perfil'}
						maxWidth={28}
						className={imageClasses}
					/>
				)
			}
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
	}, [photo, imageClasses, fallbackTone])

	return (
		<div key={user.name} className={classes.root()}>
			{Photo}
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
