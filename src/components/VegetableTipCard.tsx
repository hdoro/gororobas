import type { VegetableTipCardData } from '@/queries'
import { isRenderableRichText } from '@/utils/tiptap'
import React from 'react'
import ProfileCard from './ProfileCard'
import DefaultTipTapRenderer from './tiptap/DefaultTipTapRenderer'
import { Text } from './ui/text'

export default function VegetableTipCard({
	tip,
}: { tip: VegetableTipCardData }) {
	if (!isRenderableRichText(tip.content)) return null

	// Put user profiles last for visual balance
	const orderedSources = (tip.sources || []).sort((a, b) => {
		if (a.type === 'GOROROBAS' && b.type !== 'GOROROBAS') return 1
		if (a.type !== 'GOROROBAS' && b.type === 'GOROROBAS') return -1
		return 0
	})

	return (
		<div
			key={tip.handle}
			className="text-xl border-2 bg-background-card rounded-lg px-4 py-3"
		>
			<DefaultTipTapRenderer content={tip.content} />
			{orderedSources.length > 0 && (
				<div className="flex items-start mt-2 gap-2">
					<Text className="text-muted-foreground pt-0.5" level="sm">
						Fonte{orderedSources.length > 1 ? 's' : ''}{' '}
					</Text>
					<div className="text-base space-y-3">
						{orderedSources.map((source) => {
							if (source.type === 'GOROROBAS') {
								return (
									<React.Fragment key={source.id}>
										{source.users.map((u) => (
											<ProfileCard
												profile={{ ...u, location: undefined }}
												key={u.id}
											/>
										))}
									</React.Fragment>
								)
							}
							if (source.origin && URL.canParse(source.origin)) {
								return (
									<a
										key={source.id}
										href={source.origin}
										target="_blank"
										rel="noopener noreferrer"
										className="link"
									>
										{source.credits}
									</a>
								)
							}
							return (
								<React.Fragment key={source.id}>
									{source.credits}
								</React.Fragment>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
