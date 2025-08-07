import type {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
} from 'react'
import { cn } from '@/utils/cn'
import ProfileAvatar, { type ProfileCardProps } from './ProfileCard'

export function ProfilesGridWrapper(
  props: PropsWithChildren<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  >,
) {
  return (
    <div {...props} className={cn('flex flex-wrap gap-9', props.className)}>
      {props.children}
    </div>
  )
}

export default function ProfilesGrid({
  profiles,
  ...props
}: { profiles: ProfileCardProps['profile'][] } & DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  if (!profiles || profiles.length === 0) return null

  return (
    <ProfilesGridWrapper {...props}>
      {profiles.map((profile) => (
        <ProfileAvatar key={profile.handle} profile={profile} size="md" />
      ))}
    </ProfilesGridWrapper>
  )
}
