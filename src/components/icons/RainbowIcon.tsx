import type { SVGProps } from 'react'

export default function RainbowIcon({
	variant = 'color',
	...props
}: SVGProps<SVGSVGElement> & {
	variant: 'color' | 'monochrome'
}) {
	return (
		<svg viewBox="0 0 32 32" {...props} fill="none">
			<path
				d="M13.333 22.6667C13.333 21.9594 13.614 21.2811 14.1141 20.781C14.6142 20.281 15.2924 20 15.9997 20C16.7069 20 17.3852 20.281 17.8853 20.781C18.3854 21.2811 18.6663 21.9594 18.6663 22.6667"
				className={
					variant === 'color' ? 'stroke-customgreen-500' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8 22.6666C8 20.5449 8.84286 18.5101 10.3431 17.0098C11.8434 15.5095 13.8783 14.6666 16 14.6666C18.1217 14.6666 20.1566 15.5095 21.6569 17.0098C23.1571 18.5101 24 20.5449 24 22.6666"
				className={
					variant === 'color' ? 'stroke-customgreen-700' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M29.3332 22.6667C29.3332 19.1305 27.9284 15.7391 25.4279 13.2386C22.9274 10.7381 19.5361 9.33337 15.9998 9.33337C12.4636 9.33337 9.07223 10.7381 6.57175 13.2386C4.07126 15.7391 2.6665 19.1305 2.6665 22.6667"
				className={
					variant === 'color' ? 'stroke-customgreen-900' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
