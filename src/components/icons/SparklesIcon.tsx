import type { SVGProps } from 'react'

export default function SparklesIcon({
	variant = 'color',
	...props
}: SVGProps<SVGSVGElement> & {
	variant: 'color' | 'monochrome'
}) {
	return (
		<svg viewBox="0 0 24 25" {...props} fill="none">
			<path
				d="M9.93694 16.1411C9.84766 15.795 9.66728 15.4792 9.41456 15.2265C9.16184 14.9738 8.84601 14.7934 8.49994 14.7041L2.36494 13.1221C2.26027 13.0924 2.16815 13.0294 2.10255 12.9426C2.03696 12.8558 2.00146 12.7499 2.00146 12.6411C2.00146 12.5323 2.03696 12.4265 2.10255 12.3397C2.16815 12.2529 2.26027 12.1898 2.36494 12.1601L8.49994 10.5771C8.84589 10.4879 9.16163 10.3077 9.41434 10.0552C9.66705 9.80262 9.84751 9.48701 9.93694 9.14112L11.5189 3.00612C11.5483 2.90104 11.6113 2.80846 11.6983 2.74251C11.7852 2.67657 11.8913 2.64087 12.0004 2.64087C12.1096 2.64087 12.2157 2.67657 12.3026 2.74251C12.3896 2.80846 12.4525 2.90104 12.4819 3.00612L14.0629 9.14112C14.1522 9.48719 14.3326 9.80301 14.5853 10.0557C14.838 10.3085 15.1539 10.4888 15.4999 10.5781L21.6349 12.1591C21.7404 12.1882 21.8335 12.2511 21.8998 12.3382C21.9661 12.4253 22.002 12.5317 22.002 12.6411C22.002 12.7506 21.9661 12.857 21.8998 12.944C21.8335 13.0311 21.7404 13.094 21.6349 13.1231L15.4999 14.7041C15.1539 14.7934 14.838 14.9738 14.5853 15.2265C14.3326 15.4792 14.1522 15.795 14.0629 16.1411L12.4809 22.2761C12.4515 22.3812 12.3886 22.4738 12.3016 22.5397C12.2147 22.6057 12.1086 22.6414 11.9994 22.6414C11.8903 22.6414 11.7842 22.6057 11.6973 22.5397C11.6103 22.4738 11.5473 22.3812 11.5179 22.2761L9.93694 16.1411Z"
				className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M20 3.64111V7.64111"
				className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M22 5.64111H18"
				className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M4 17.6411V19.6411"
				className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M5 18.6411H3"
				className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	)
}
