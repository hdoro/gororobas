'use client'

import { useMentionData } from '@/hooks/useMentionData'
import type { ImageForRendering } from '@/types'
import { cn } from '@/utils/cn'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import { SanityImage } from '../SanityImage'

export function Mention(props: {
  id: string
  label: string
  image?: ImageForRendering | null
}) {
  const { data, isLoading } = useMentionData(props.id)

  const freshMention = data && 'mention' in data ? data.mention : undefined

  if (!freshMention) {
    return (
      <span
        className={cn(
          'relative font-medium text-primary-700',
          isLoading && 'animate-pulse',
        )}
      >
        {props.image && (
          <SanityImage
            image={props.image}
            maxWidth={24}
            className="mr-1 inline-block size-6 rounded-full object-cover"
          />
        )}{' '}
        {props.label}
      </span>
    )
  }

  const href =
    freshMention.objectType === 'UserProfile'
      ? paths.userProfile(freshMention.handle)
      : paths.vegetable(freshMention.handle)
  return (
    <Link href={href} className="font-medium text-primary-700 underline">
      {freshMention.image && (
        <SanityImage
          image={freshMention.image}
          maxWidth={24}
          className="mr-1 inline-block size-6 rounded-full object-cover"
        />
      )}{' '}
      {freshMention.label}
    </Link>
  )
}
