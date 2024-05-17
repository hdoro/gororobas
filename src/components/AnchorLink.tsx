'use client'

import {
	type AnchorHTMLAttributes,
	type DetailedHTMLProps,
	type MouseEventHandler,
	type PropsWithChildren,
	useCallback,
} from 'react'

export default function AnchorLink({
	scrollSmoothly = true,
	...props
}: PropsWithChildren<
	DetailedHTMLProps<
		AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	> & { scrollSmoothly?: boolean }
>) {
	const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
		(e) => {
			if (scrollSmoothly && props.href) {
				e.preventDefault()
				const target = document.querySelector(props.href)
				if (target) {
					target.scrollIntoView({ behavior: 'smooth', block: 'center' })
				}
			}
		},
		[scrollSmoothly, props.href],
	)

	return (
		<a
			{...props}
			// biome-ignore lint: this is just a progressive enhancement
			onClick={handleClick}
		>
			{props.children}
		</a>
	)
}
