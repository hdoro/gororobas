import type { PropsWithChildren } from 'react'
import type { ProfileLayoutData } from '@/queries'
import ProfilePageHeader from './ProfilePageHeader'
import { ProfilePageNavigation } from './ProfilePageNavigation'

export default function ProfileLayout(
  props: PropsWithChildren<{
    profile: ProfileLayoutData
  }>,
) {
  return (
    <main className="py-10">
      <ProfilePageHeader profile={props.profile} />
      <ProfilePageNavigation handle={props.profile.handle} />

      {props.children}
    </main>
  )
}
