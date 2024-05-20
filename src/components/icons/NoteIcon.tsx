import type { SVGProps } from 'react'

export default function NoteIcon({
	variant = 'color',
	...props
}: SVGProps<SVGSVGElement> & {
	variant: 'color' | 'monochrome'
}) {
	return (
		<svg viewBox="0 0 32 32" {...props} fill="none">
			<path
				d="M17.8663 2.66675H7.99967C7.29243 2.66675 6.61415 2.9477 6.11406 3.4478C5.61396 3.94789 5.33301 4.62617 5.33301 5.33341V26.6667C5.33301 27.374 5.61396 28.0523 6.11406 28.5524C6.61415 29.0525 7.29243 29.3334 7.99967 29.3334H23.9997C24.7069 29.3334 25.3852 29.0525 25.8853 28.5524C26.3854 28.0523 26.6663 27.374 26.6663 26.6667V16.8001"
				className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M2.66699 8H8.00033"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M2.66699 13.3333H8.00033"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M2.66699 18.6667H8.00033"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M2.66699 24H8.00033"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M24.5333 3.46657C25.0891 3.10783 25.7511 2.95037 26.4088 3.02043C27.0666 3.09049 27.6806 3.38383 28.1483 3.85159C28.6161 4.31935 28.9094 4.93327 28.9795 5.59106C29.0495 6.24885 28.8921 6.91079 28.5333 7.46657L21.3333 14.6666L16 15.9999L17.3333 10.6666L24.5333 3.46657Z"
				className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
				strokeWidth="2.66667"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}
