import type { SVGProps } from 'react'

export default function BulbIcon({
	variant = 'color',
	...props
}: SVGProps<SVGSVGElement> & {
	variant: 'color' | 'monochrome'
}) {
	return (
		<svg viewBox="0 0 32 33" aria-hidden {...props} fill="none">
			<path
				d="M20 18.9633C20.2667 17.6299 20.9333 16.6966 22 15.6299C23.3333 14.4299 24 12.6966 24 10.9633C24 8.84153 23.1571 6.80669 21.6569 5.3064C20.1566 3.80611 18.1217 2.96326 16 2.96326C13.8783 2.96326 11.8434 3.80611 10.3431 5.3064C8.84286 6.80669 8 8.84153 8 10.9633C8 12.2966 8.26667 13.8966 10 15.6299C10.9333 16.5633 11.7333 17.6299 12 18.9633"
				className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 24.2966H20"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13.3335 29.63H18.6668"
				className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
