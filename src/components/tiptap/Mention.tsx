'use client'

import Link from '@/components/LinkWithTransition'
import { useMentionData } from '@/hooks/useMentionData'
import type { RichTextMentionAttributesInForm } from '@/schemas'
import { cn } from '@/utils/cn'
import { paths } from '@/utils/urls'
import { SanityImage } from '../SanityImage'

export function Mention(props: RichTextMentionAttributesInForm['data']) {
  const { data, isLoading } = useMentionData(props.id)

  const freshMention = data && 'mention' in data ? data.mention : undefined

  if (!freshMention) {
    return (
      <span
        className={cn(
          'text-primary-700 relative px-1 font-medium',
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
    <Link
      href={href}
      className="text-primary-700 px-1 font-medium underline"
      onClick={(e) => {
        // Prevent an eventual parent NoteCard from flipping
        e.stopPropagation()
      }}
    >
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
