import type { SVGProps } from 'react'

export default function ShapesIcon({
	variant = 'color',
	...props
}: SVGProps<SVGSVGElement> & {
	variant: 'color' | 'monochrome'
}) {
	return (
		<svg {...props} fill="none" viewBox="0 0 32 33">
			<path
				d="M11.0667 13.6299C10.8948 13.6393 10.7237 13.601 10.5723 13.5192C10.4208 13.4374 10.2949 13.3153 10.2085 13.1664C10.1222 13.0175 10.0786 12.8476 10.0828 12.6755C10.0869 12.5034 10.1386 12.3358 10.2321 12.1913L15.2001 4.29662C15.2781 4.15604 15.3912 4.03802 15.5283 3.95399C15.6654 3.86996 15.8218 3.82277 15.9825 3.81701C16.1432 3.81124 16.3027 3.84708 16.4454 3.92107C16.5882 3.99505 16.7094 4.10467 16.7974 4.23928L21.7334 12.1633C21.8307 12.303 21.8879 12.4667 21.8988 12.6366C21.9098 12.8065 21.8741 12.9762 21.7955 13.1272C21.717 13.2783 21.5986 13.405 21.4532 13.4936C21.3078 13.5822 21.141 13.6294 20.9707 13.6299H11.0667Z"
				stroke="#22C55E"
				className={
					variant === 'color' ? 'stroke-primary-500' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12 18.9634H5.33333C4.59695 18.9634 4 19.5603 4 20.2967V26.9634C4 27.6998 4.59695 28.2967 5.33333 28.2967H12C12.7364 28.2967 13.3333 27.6998 13.3333 26.9634V20.2967C13.3333 19.5603 12.7364 18.9634 12 18.9634Z"
				stroke="#14532D"
				className={
					variant === 'color' ? 'stroke-primary-900' : 'stroke-current'
				}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M23.3332 28.2967C25.9105 28.2967 27.9998 26.2074 27.9998 23.63C27.9998 21.0527 25.9105 18.9634 23.3332 18.9634C20.7558 18.9634 18.6665 21.0527 18.6665 23.63C18.6665 26.2074 20.7558 28.2967 23.3332 28.2967Z"
				stroke="#15803D"
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
