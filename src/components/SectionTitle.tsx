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
		<Text
			level="h2"
			as="h2"
			// This `px` is to align the text with the page padding, leaving the icon to the left of it
			className="px-pageX xl:px-[calc(var(--page-padding-x)_-_2.625rem)] flex gap-2.5 flex-col xl:flex-row xl:items-center"
		>
			{Icon && <Icon variant="color" className="w-8" />}
			{children}
			{CTA && <div className="flex-1 text-right">{CTA}</div>}
		</Text>
	)
}
