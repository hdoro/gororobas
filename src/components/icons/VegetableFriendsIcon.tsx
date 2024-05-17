import type { SVGProps } from 'react'

export default function VegetableFriendsIcon({
	variant = 'color',
	...props
}: SVGProps<SVGSVGElement> & {
	variant: 'color' | 'monochrome'
}) {
	return (
		<svg viewBox="0 0 32 33" aria-hidden {...props} fill="none">
			<path
				d="m9.7 23.64-3.5-3.5C4.1 18.11 2 15.66 2 12.44a7.7 7.7 0 0 1 7.7-7.7c2.46 0 4.2.7 6.3 2.8 2.1-2.1 3.84-2.8 6.3-2.8a7.7 7.7 0 0 1 7.7 7.7c0 3.2-2.11 5.66-4.2 7.7l-3.5 3.5"
				className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
				strokeWidth="2.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16.72 16.3c-1.12 1.82.15 4.9-.08 6.88"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				strokeWidth="1.45"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13.92 15.1c.88.64 1.44 1.76 1.84 2.96-1.6.32-2.8.32-3.84-.24-.96-.48-1.84-1.52-2.4-3.36 2.24-.4 3.52 0 4.4.64ZM17.6 12.9a5.6 5.6 0 0 0-.88 3.2 5.85 5.85 0 0 0 3.44-1.12c.8-.8 1.28-1.84 1.36-3.68-2.16.08-3.2.8-3.92 1.6Z"
				className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16.67 22.3s.33 1.76 1.09 2.53c.75.76 2.53 1.08 2.53 1.08M16.64 23.3s-.33 1.76-1.09 2.53c-.75.76-2.53 1.08-2.53 1.08"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				strokeWidth="1.45"
				strokeLinecap="round"
			/>
		</svg>
	)
}
