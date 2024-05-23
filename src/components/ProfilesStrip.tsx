import type { WishlistedByData } from '@/queries'
import ProfileCard from './ProfileCard'

export default function ProfilesStrip({
	profiles,
}: { profiles: WishlistedByData['wishlisted_by'][number]['user_profile'][] }) {
	return (
		<div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
			{profiles.map((profile, index) => (
				<ProfileCard
					key={profile.name}
					profile={profile}
					fallbackTone={index % 2 === 0 ? 'primary' : 'secondary'}
					size="sm"
				/>
			))}
		</div>
	)
}
