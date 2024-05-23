import { Text } from '@/components/ui/text'
import type { PropsWithChildren, SVGProps } from 'react'

export default function SectionTitle({
	children,
	Icon,
	CTA,
}: PropsWithChildren<{
	Icon?: (
		props: SVGProps<SVGSVGElement> & {
			variant: 'color' | 'monochrome'
		},
	) => JSX.Element
	CTA?: JSX.Element | null
}>) {
	return (
		<Text level="h2" as="h2" className="px-pageX flex gap-2.5 items-center">
			{Icon && (
				<Icon variant="color" className="w-6 md:w-8 flex-[0_0_maxcontent]" />
			)}
			{children}
			{CTA && <div className="flex-1 text-right">{CTA}</div>}
		</Text>
	)
}
