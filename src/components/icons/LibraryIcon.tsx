import type { SVGProps } from 'react'

export default function LibraryIcon({
  variant = 'color',
  ...props
}: SVGProps<SVGSVGElement> & {
  variant: 'color' | 'monochrome'
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      {...props}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.3998 18.9C20.5998 19.4 20.2998 20 19.7998 20.2L17.8998 20.9C17.3998 21.1 16.7998 20.8 16.5998 20.3L11.0998 5.1C10.8998 4.6 11.1998 4 11.6998 3.8L13.5998 3.1C14.0998 2.9 14.6998 3.2 14.8998 3.7L20.3998 18.9Z"
        className={variant === 'color' ? 'stroke-green-500' : 'stroke-current'}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4 2C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H7C6.44772 22 6 21.5523 6 21V20H4V4H6V3C6 2.44772 6.44772 2 7 2H4Z"
        className={variant === 'color' ? 'fill-green-900' : 'fill-current'}
      />
      <path
        d="M7 22H10C11.1046 22 12 21.1046 12 20V4C12 2.89543 11.1046 2 10 2H7C7.55228 2 8 2.44772 8 3V4H10V20H8V21C8 21.5523 7.55228 22 7 22Z"
        className={variant === 'color' ? 'fill-green-700' : 'fill-current'}
      />
      <path
        d="M7 3V21"
        className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
