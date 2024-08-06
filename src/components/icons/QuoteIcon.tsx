import type { SVGProps } from 'react'

export default function QuoteIcon({
  variant = 'color',
  ...props
}: SVGProps<SVGSVGElement> & {
  variant: 'color' | 'monochrome'
}) {
  return (
    <svg viewBox="0 0 24 25" aria-hidden {...props} fill="none">
      <path
        d="M21 15.6411C21 16.1715 20.7893 16.6803 20.4142 17.0553C20.0391 17.4304 19.5304 17.6411 19 17.6411H7L3 21.6411V5.64111C3 5.11068 3.21071 4.60197 3.58579 4.2269C3.96086 3.85183 4.46957 3.64111 5 3.64111H19C19.5304 3.64111 20.0391 3.85183 20.4142 4.2269C20.7893 4.60197 21 5.11068 21 5.64111V15.6411Z"
        className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12.6411C8.53043 12.6411 9.03914 12.4304 9.41421 12.0553C9.78929 11.6803 10 11.1715 10 10.6411V8.64111H8"
        className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 12.6411C14.5304 12.6411 15.0391 12.4304 15.4142 12.0553C15.7893 11.6803 16 11.1715 16 10.6411V8.64111H14"
        className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
