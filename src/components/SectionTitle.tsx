import { Text } from '@/components/ui/text'
import type { PropsWithChildren, SVGProps } from 'react'

export default function SectionTitle({
	children,
	Icon,
}: PropsWithChildren<{
	Icon?: (
		props: SVGProps<SVGSVGElement> & {
			variant: 'color' | 'monochrome'
		},
	) => JSX.Element
}>) {
	return (
		<Text level="h2" className="px-pageX flex gap-2.5 items-center">
			{Icon && <Icon variant="color" className="w-8" />}
			{children}
		</Text>
	)
}
