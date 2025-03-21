import type { ProfileData, StoredImageDataInForm } from '@/schemas'
import type { ImageForRendering } from '@/types'
import { cn } from '@/utils/cn'
import { paths } from '@/utils/urls'
import { SproutIcon } from 'lucide-react'
import { type VariantProps, tv } from 'tailwind-variants'
import ProfileCardLink from './ProfileCardLink'
import { SanityImage } from './SanityImage'
import { Text } from './ui/text'

const profileCardVariants = tv({
  slots: {
    root: 'shrink-0 flex items-center flex-wrap',
    image:
      'block object-cover rounded-full bg-background-card text-xs overflow-hidden',
    name: 'max-w-[16ch] truncate',
    location: '',
    textContainer: '',
  },
  variants: {
    size: {
      sm: {
        root: 'gap-2',
        image: 'w-7 h-7',
        name: 'text-sm md:text-sm',
        location: 'text-xs md:text-xs text-muted-foreground',
        textContainer: '-space-y-0.5',
      },
      md: {
        root: 'gap-3',
        image: 'w-24 h-24',
        name: 'text-lg md:text-lg',
      },
      lg: {
        root: 'gap-4',
        image: 'w-40 h-40',
        name: 'text-2xl md:text-3xl',
        location: 'text-xl md:text-xl',
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

export type ProfileCardProps = VariantProps<typeof profileCardVariants> & {
  profile: {
    name?: string | undefined | null
    handle?: string | undefined | null
    location?: string | undefined | null
    photo?:
      | ImageForRendering
      | (typeof ProfileData.Type)['photo']
      | Partial<typeof StoredImageDataInForm.Encoded>
      | null
      | undefined
  }
  fallbackTone?: 'primary' | 'secondary'
  linkToProfile?: boolean
}

export default function ProfileCard(props: ProfileCardProps) {
  const {
    profile,
    size = 'sm',
    includeName = true,
    linkToProfile = true,
  } = props

  if (includeName && !profile.name) return null

  const classes = profileCardVariants({ size, includeName })

  return (
    <ProfileCardLink
      asLink={linkToProfile && !!profile.handle}
      key={profile.name}
      className={classes.root()}
      href={
        linkToProfile && profile.handle
          ? paths.userProfile(profile.handle)
          : undefined
      }
    >
      <ProfilePhoto {...props} />
      {includeName && (
        <div className={classes.textContainer()}>
          <Text className={classes.name()}>{profile.name}</Text>
          {profile.location && (
            <Text level="sm" className={classes.location()}>
              {profile.location}
            </Text>
          )}
        </div>
      )}
    </ProfileCardLink>
  )
}

const SIZE_MAP: Record<Exclude<ProfileCardProps['size'], undefined>, number> = {
  sm: 28,
  md: 100,
  lg: 160,
}

export function ProfilePhoto({
  profile,
  fallbackTone = 'primary',
  size = 'sm',
  includeName = true,
}: ProfileCardProps) {
  const { photo } = profile
  const classes = profileCardVariants({ size, includeName })

  if (photo && 'file' in photo && photo.file instanceof File) {
    return (
      <img
        src={URL.createObjectURL(photo.file)}
        alt={'Foto de perfil'}
        className={classes.image()}
      />
    )
  }

  if (photo && 'sanity_id' in photo && photo.sanity_id) {
    return (
      <SanityImage
        image={{
          sanity_id: photo.sanity_id,
        }}
        alt={`Foto de perfil ${profile.name ? ` de ${profile.name}` : ''}`}
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
