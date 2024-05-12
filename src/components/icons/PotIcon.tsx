import type { SVGProps } from 'react'

export default function PotIcon({
	variant = 'color',
	...props
}: SVGProps<SVGSVGElement> & {
	variant: 'color' | 'monochrome'
}) {
	return (
		<svg viewBox="0 0 32 33" fill="none" aria-hidden {...props}>
			<path
				d="M2.6665 16.5933H29.3332"
				className={
					variant === 'color' ? 'stroke-primary-900' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M26.6668 16.5933V27.2599C26.6668 27.9672 26.3859 28.6454 25.8858 29.1455C25.3857 29.6456 24.7074 29.9266 24.0002 29.9266H8.00016C7.29292 29.9266 6.61464 29.6456 6.11454 29.1455C5.61445 28.6454 5.3335 27.9672 5.3335 27.2599V16.5933"
				className={
					variant === 'color' ? 'stroke-primary-900' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M11.8133 9.63332L11.2133 7.21998C11.1274 6.88029 11.1092 6.52699 11.1598 6.18027C11.2105 5.83356 11.329 5.50022 11.5085 5.19932C11.6881 4.89842 11.9252 4.63585 12.2063 4.42663C12.4873 4.21741 12.8069 4.06564 13.1467 3.97999L15.7333 3.33999C16.0739 3.25423 16.4281 3.2366 16.7755 3.28811C17.1229 3.33962 17.4567 3.45925 17.7578 3.64013C18.0589 3.82101 18.3212 4.05958 18.5298 4.34214C18.7384 4.6247 18.8891 4.94568 18.9733 5.28665L19.5733 7.68665"
				className={
					variant === 'color' ? 'stroke-primary-500' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5.3335 11.2598L26.6668 5.92651"
				className={
					variant === 'color' ? 'stroke-primary-700' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
