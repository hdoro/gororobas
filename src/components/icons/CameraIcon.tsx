import type { SVGProps } from 'react'

export default function CameraIcon({
  variant = 'color',
  ...props
}: SVGProps<SVGSVGElement> & {
  variant: 'color' | 'monochrome'
}) {
  return (
    <svg viewBox="0 0 24 24" {...props} fill="none">
      <path
        d="M14.5 4H9.5L7 7H4C3.46957 7 2.96086 7.21071 2.58579 7.58579C2.21071 7.96086 2 8.46957 2 9V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H17L14.5 4Z"
        className={variant === 'color' ? 'stroke-green-900' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
        className={variant === 'color' ? 'stroke-green-700' : 'stroke-current'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="10"
        r="1"
        className={variant === 'color' ? 'fill-green-500' : 'fill-current'}
      />
    </svg>
  )
}
