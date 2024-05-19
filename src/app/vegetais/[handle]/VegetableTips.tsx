import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Text } from '@/components/ui/text'
import type { TipSubject } from '@/edgedb.interfaces'
import type { VegetablePageData } from '@/queries'
import { RichText } from '@/schemas'
import { cn } from '@/utils/cn'
import { TIP_SUBJECT_TO_LABEL } from '@/utils/labels'
import { Schema } from '@effect/schema'

export default function VegetableTips({
	vegetable,
}: {
	vegetable: VegetablePageData
}) {
	const { tips = [] } = vegetable
	if (!Array.isArray(tips) || tips.length === 0) return null

	return (
		<div className="px-pageX max-w-[73.125rem] box-content">
			{Object.entries(TIP_SUBJECT_TO_LABEL).map(
				([subject, label], idx, arr) => {
					const subjectTips = tips.filter((tip) =>
						tip.subjects.includes(subject as TipSubject),
					)

					if (subjectTips.length === 0) return null

					return (
						<div
							key={subject}
							className={cn(
								'mt-10 pb-10 flex gap-10',
								idx + 1 < arr.length && 'border-b-2 border-b-secondary-50',
							)}
						>
							<Text
								weight="semibold"
								level="h3"
								className="w-[12.5rem] flex-shrink-0"
							>
								{label}
							</Text>
							<div className="space-y-4 flex-1">
								{subjectTips.map((tip) => {
									if (!Schema.is(RichText)(tip.content)) return null

									return (
										<div key={tip.handle} className="text-lg px-4 flex gap-2">
											<div className="w-2 h-1 flex-[0_0_0.5rem] mt-3 rounded-sm bg-green-400" />
											<TipTapRenderer content={tip.content} />
										</div>
									)
								})}
							</div>
						</div>
					)
				},
			)}
		</div>
	)
}
